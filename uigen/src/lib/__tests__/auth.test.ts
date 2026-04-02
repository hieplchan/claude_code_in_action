// @vitest-environment node
import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock server-only so it doesn't throw in test environment
vi.mock("server-only", () => ({}));

// Mock next/headers cookies
const mockSet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ set: mockSet })),
}));

import { createSession } from "@/lib/auth";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

describe("createSession", () => {
  beforeEach(() => {
    mockSet.mockClear();
  });

  test("sets an httpOnly cookie with the auth token", async () => {
    await createSession("user-1", "user@example.com");

    expect(mockSet).toHaveBeenCalledOnce();
    const [cookieName, , cookieOptions] = mockSet.mock.calls[0];
    expect(cookieName).toBe("auth-token");
    expect(cookieOptions.httpOnly).toBe(true);
    expect(cookieOptions.sameSite).toBe("lax");
    expect(cookieOptions.path).toBe("/");
  });

  test("token contains correct userId and email claims", async () => {
    await createSession("user-42", "hello@test.com");

    const token = mockSet.mock.calls[0][1];
    const { payload } = await jwtVerify(token, JWT_SECRET);

    expect(payload.userId).toBe("user-42");
    expect(payload.email).toBe("hello@test.com");
  });

  test("token expires in ~7 days", async () => {
    const before = Date.now();
    await createSession("user-1", "user@example.com");
    const after = Date.now();

    const token = mockSet.mock.calls[0][1];
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    expect(payload.exp! * 1000).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
    expect(payload.exp! * 1000).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
  });

  test("cookie expiry matches token expiry", async () => {
    await createSession("user-1", "user@example.com");

    const [, , cookieOptions] = mockSet.mock.calls[0];
    const token = mockSet.mock.calls[0][1];
    const { payload } = await jwtVerify(token, JWT_SECRET);

    expect(cookieOptions.expires.getTime()).toBeCloseTo(payload.exp! * 1000, -3);
  });
});
