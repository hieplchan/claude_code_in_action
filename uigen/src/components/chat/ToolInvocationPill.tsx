"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocationPillProps {
  toolInvocation: {
    toolName: string;
    args: { command?: string; path?: string; new_path?: string };
    state: string;
    result?: unknown;
    toolCallId: string;
  };
}

function getFilename(path?: string): string {
  if (!path) return "";
  return path.split("/").pop() || path;
}

function getLabel(toolName: string, args: ToolInvocationPillProps["toolInvocation"]["args"], isDone: boolean): string {
  const file = getFilename(args.path);

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return isDone ? `Created ${file}` : `Creating ${file}`;
      case "str_replace":
      case "insert":
        return isDone ? `Edited ${file}` : `Editing ${file}`;
      case "view":
        return isDone ? `Viewed ${file}` : `Viewing ${file}`;
      case "undo_edit":
        return isDone ? `Undid edit on ${file}` : `Undoing edit on ${file}`;
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "rename":
        return isDone ? `Renamed ${file}` : `Renaming ${file}`;
      case "delete":
        return isDone ? `Deleted ${file}` : `Deleting ${file}`;
    }
  }

  return toolName;
}

export function ToolInvocationPill({ toolInvocation }: ToolInvocationPillProps) {
  const isDone = toolInvocation.state === "result";
  const label = getLabel(toolInvocation.toolName, toolInvocation.args, isDone);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
