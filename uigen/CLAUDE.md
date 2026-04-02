# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface; Claude generates JSX files into a virtual file system that renders live in an iframe. No actual files are written to disk.

## Commands

```bash
npm run setup        # First-time setup: install deps + prisma generate + migrate
npm run dev          # Start dev server with Turbopack (localhost:3000)
npm run dev:daemon   # Start in background, logs to logs.txt
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest (all tests)
npm run db:reset     # Destructive: reset all migrations
```

Run a single test file:
```bash
npx vitest run src/lib/__tests__/file-system.test.ts
```

## Environment Variables

- `ANTHROPIC_API_KEY` — Optional. If absent, the app uses a mock provider with pre-canned responses.
- `JWT_SECRET` — Defaults to `"development-secret-key"` in dev.

## Architecture

### AI Generation Flow

1. User sends a message → `POST /api/chat` (`src/app/api/chat/route.ts`)
2. Route calls `streamText()` (Vercel AI SDK) with `maxSteps: 40` and two tools: `str_replace_editor` and `file_manager`
3. Claude's tool calls create/edit files in the virtual file system
4. File state is streamed back; `FileSystemContext` updates client state
5. `PreviewFrame` picks up new files and re-renders the iframe

### Virtual File System (`src/lib/file-system.ts`)

In-memory tree structure — nothing touches disk. All generated components live here. Key methods: `createFile`, `updateFile`, `readFile`, `deleteFile`, `serialize`/`deserialize`. Used on both server (tool execution) and client (display/edit).

### AI Provider (`src/lib/provider.ts`)

`getLanguageModel()` returns either `claude-haiku-4-5` (real) or `MockLanguageModel` (no API key). The mock simulates multi-step tool calls producing sample components so the full UI is exercisable without an API key.

### JSX Preview (`src/lib/transform/jsx-transformer.ts` + `src/components/preview/PreviewFrame.tsx`)

Babel standalone transpiles virtual FS files inside the iframe. An import map handles inter-component dependencies. Tailwind CSS is injected via CDN. The iframe is sandboxed and re-evaluated on every file change.

### Authentication

JWT-based with httpOnly cookies (7-day expiry). `src/lib/auth.ts` handles token sign/verify; `src/actions/index.ts` exposes `signUp`, `signIn`, `signOut` server actions. Middleware (`src/middleware.ts`) protects `/api/projects` and `/api/filesystem`. Anonymous users get full functionality; persistence requires login.

### Database

Prisma + SQLite (`prisma/dev.db`). The schema is defined in `prisma/schema.prisma` — always reference it to understand the data structure. Two models: `User` and `Project`. Projects store serialized message history and file system state as JSON strings. Only authenticated users have projects persisted.

### State Management

Two React contexts wire everything together:
- `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) — virtual FS state + mutations
- `ChatContext` (`src/lib/contexts/chat-context.tsx`) — wraps Vercel AI SDK `useChat` hook

### UI Layout (`src/app/main-content.tsx`)

Left 35%: chat panel (`MessageList` + `MessageInput`). Right 65%: tabbed Preview (iframe) / Code (file tree + Monaco editor) view.

## Code Style

- Use comments sparingly — only for complex or non-obvious logic.

## Testing

Tests live in `__tests__` folders alongside source. Framework: Vitest + jsdom + React Testing Library. Key test areas: `FileSystem`, `JSXTransformer`, `ChatInterface`, `MessageList`, `MessageInput`.
