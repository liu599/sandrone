"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { Search, Bot, CheckIcon, XCircleIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ToolDetailsDrawer,
  isCancelled as checkIsCancelled,
  isLoading as checkIsLoading,
} from "@/components/assistant-ui/tool-ui-shared";

export { TodoListUI } from "./todo-list";

// --- Generic Tool UI Wrapper ---
const ToolUIWrapper = ({
  toolName,
  status,
  argsText,
  result,
}: {
  toolName: string;
  status?: any;
  argsText: string;
  result?: any;
}) => {
  const isCancelledStatus = checkIsCancelled(status);
  const isLoadingStatus = checkIsLoading(status);

  return (
    <div
      className={cn(
        "mb-4 flex w-full items-center gap-2 rounded-lg border py-2 px-4 transition-colors",
        isCancelledStatus && "border-muted-foreground/30 bg-muted/30"
      )}
    >
      {isCancelledStatus ? (
        <XCircleIcon className="size-4 text-muted-foreground" />
      ) : isLoadingStatus ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <CheckIcon className="size-4 text-green-500" />
      )}

      <p
        className={cn(
          "grow text-sm",
          isCancelledStatus && "text-muted-foreground line-through"
        )}
      >
        {isCancelledStatus
          ? "Cancelled tool: "
          : isLoadingStatus
            ? "运行中: "
            : "已完成: "}
        <span className="font-semibold">{toolName}</span>
      </p>

      <ToolDetailsDrawer
        toolName={toolName}
        argsText={argsText}
        result={result}
        status={status}
      />
    </div>
  );
};

interface SearchKBArgs {
  query: string;
  sourceType?: string;
}

interface SearchKBResult {
  results: Array<Record<string, unknown>>;
  query: string;
  total: number;
  error?: string;
}

export const SearchKnowledgeBaseUI = makeAssistantToolUI<
  SearchKBArgs,
  SearchKBResult
>({
  toolName: "search_knowledge_base",
  render: ({ args, result, status, argsText }) => {
    return (
      <ToolUIWrapper
        toolName="Knowledge Base Search"
        status={status}
        argsText={argsText}
        result={result}
      />
    );
  },
});

// Sub-agent UI component
interface SubAgentArgs {
  prompt: string;
  subAgentId: string;
}

interface SubAgentResult {
  message: string;
}

export const SubAgentUI = makeAssistantToolUI<SubAgentArgs, SubAgentResult>({
  toolName: "SubAgent",
  render: ({ args, result, status, argsText }) => {
    return (
      <ToolUIWrapper
        toolName={`SubAgent: ${args.prompt || "Thinking"}`}
        status={status}
        argsText={argsText}
        result={result}
      />
    );
  },
});
