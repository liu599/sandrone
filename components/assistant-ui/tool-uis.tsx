"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { Search, FileText, AlertCircle } from "lucide-react";

export { TodoListUI } from "./todo-list";

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
  render: ({ args, result, status }) => {
    return (
      <div className="my-3 w-full overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5">
          <Search className="size-4 text-primary" />
          <h3 className="font-medium text-sm">Knowledge Base Search</h3>
          {status?.type === "running" && (
            <span className="ml-auto text-muted-foreground text-xs">
              Searching...
            </span>
          )}
        </div>

        <div className="px-4 py-2.5">
          <p className="text-muted-foreground text-xs">
            Query: <span className="text-foreground">{args.query}</span>
          </p>
        </div>

        {result && (
          <div className="border-t px-4 py-2.5">
            {result.error ? (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="size-4" />
                {result.error}
              </div>
            ) : result.total > 0 ? (
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs">
                  Found {result.total} result(s)
                </p>
                {result.results.slice(0, 3).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-md bg-muted/30 p-2 text-sm"
                  >
                    <FileText className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    <span className="line-clamp-2">
                      {typeof item === "string"
                        ? item
                        : JSON.stringify(item).slice(0, 200)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No results found.</p>
            )}
          </div>
        )}
      </div>
    );
  },
});
