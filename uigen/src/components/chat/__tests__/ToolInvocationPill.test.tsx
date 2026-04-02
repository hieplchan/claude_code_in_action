import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationPill } from "../ToolInvocationPill";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  toolName: string,
  args: { command?: string; path?: string; new_path?: string },
  state: "call" | "result" = "call"
) {
  return { toolName, args, state, result: state === "result" ? "Success" : undefined, toolCallId: "test-id" };
}

test("str_replace_editor create pending shows Creating label and spinner", () => {
  render(<ToolInvocationPill toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/Counter.jsx" }, "call")} />);
  expect(screen.getByText("Creating Counter.jsx")).toBeDefined();
  expect(screen.queryByText("Created Counter.jsx")).toBeNull();
});

test("str_replace_editor create done shows Created label and green dot", () => {
  render(<ToolInvocationPill toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/Counter.jsx" }, "result")} />);
  expect(screen.getByText("Created Counter.jsx")).toBeDefined();
  expect(screen.queryByText("Creating Counter.jsx")).toBeNull();
});

test("str_replace_editor str_replace done shows Edited label", () => {
  render(<ToolInvocationPill toolInvocation={makeInvocation("str_replace_editor", { command: "str_replace", path: "/App.jsx" }, "result")} />);
  expect(screen.getByText("Edited App.jsx")).toBeDefined();
});

test("str_replace_editor insert pending shows Editing label", () => {
  render(<ToolInvocationPill toolInvocation={makeInvocation("str_replace_editor", { command: "insert", path: "/App.jsx" }, "call")} />);
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("str_replace_editor view shows Viewing label", () => {
  render(<ToolInvocationPill toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "/App.jsx" }, "call")} />);
  expect(screen.getByText("Viewing App.jsx")).toBeDefined();
});

test("str_replace_editor undo_edit pending shows Undoing edit label", () => {
  render(<ToolInvocationPill toolInvocation={makeInvocation("str_replace_editor", { command: "undo_edit", path: "/App.jsx" }, "call")} />);
  expect(screen.getByText("Undoing edit on App.jsx")).toBeDefined();
});

test("file_manager rename pending shows Renaming label", () => {
  render(<ToolInvocationPill toolInvocation={makeInvocation("file_manager", { command: "rename", path: "/OldName.jsx" }, "call")} />);
  expect(screen.getByText("Renaming OldName.jsx")).toBeDefined();
});

test("file_manager delete done shows Deleted label", () => {
  render(<ToolInvocationPill toolInvocation={makeInvocation("file_manager", { command: "delete", path: "/OldFile.jsx" }, "result")} />);
  expect(screen.getByText("Deleted OldFile.jsx")).toBeDefined();
});

test("unknown tool falls back to tool name", () => {
  render(<ToolInvocationPill toolInvocation={makeInvocation("unknown_tool", { command: "something" }, "call")} />);
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("nested path shows only filename", () => {
  render(<ToolInvocationPill toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/components/ui/Button.tsx" }, "result")} />);
  expect(screen.getByText("Created Button.tsx")).toBeDefined();
});
