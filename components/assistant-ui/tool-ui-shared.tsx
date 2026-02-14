"use client";

import { useState } from "react";
import {
  CheckIcon,
  ChevronRightIcon,
  Loader2Icon,
  XCircleIcon,
  CopyIcon,
  CheckCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// ── Copy Button Component ──────────────────────────────────────────────
export const CopyButton = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={handleCopy}
    >
      {copied ? (
        <CheckCircleIcon className="size-3.5 text-green-500" />
      ) : (
        <CopyIcon className="size-3.5" />
      )}
    </Button>
  );
};

// ── Tool Details Drawer Component ──────────────────────────────────────────────
export const ToolDetailsDrawer = ({
  toolName,
  argsText,
  result,
  status,
}: {
  toolName: string;
  argsText: string;
  result?: any;
  status?: any;
}) => {
  const isCancelled =
    status?.type === "incomplete" && status.reason === "cancelled";
  const cancelledReason =
    isCancelled && status.error
      ? typeof status.error === "string"
        ? status.error
        : JSON.stringify(status.error)
      : null;

  return (
    <Sheet modal={false}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ChevronRightIcon className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        hideOverlay
        className="sm:max-w-md border-l shadow-2xl p-0 flex flex-col h-full"
      >
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-base font-bold">
            调用详情: {toolName}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-6 relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-[33px] top-10 bottom-10 w-[2px] bg-muted/50 -z-10" />

          <div className="flex flex-col gap-8">
            {cancelledReason && (
              <div className="flex gap-4">
                <div className="relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm mt-1">
                  <div className="h-2 w-2 rounded-full bg-destructive" />
                </div>
                <div className="aui-tool-fallback-cancelled-root flex-1">
                  <p className="aui-tool-fallback-cancelled-header font-semibold text-sm text-muted-foreground">
                    Cancelled reason:
                  </p>
                  <p className="aui-tool-fallback-cancelled-reason text-sm text-muted-foreground mt-1">
                    {cancelledReason}
                  </p>
                </div>
              </div>
            )}

            <div className={cn("flex gap-4", isCancelled && "opacity-60")}>
              <div className="relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm mt-1">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div className="aui-tool-fallback-args-root flex-1">
                <p className="font-semibold text-sm mb-2">参数:</p>
                <div className="group relative">
                  <pre className="aui-tool-fallback-args-value whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-xs max-h-[300px] overflow-auto border">
                    {argsText}
                  </pre>
                  <CopyButton content={argsText} />
                </div>
              </div>
            </div>

            {!isCancelled && result !== undefined && (
              <div className="flex gap-4">
                <div className="relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                </div>
                <div className="aui-tool-fallback-result-root flex-1">
                  <p className="aui-tool-fallback-result-header font-semibold text-sm mb-2">
                    结果:
                  </p>
                  <div className="group relative">
                    <pre className="aui-tool-fallback-result-content whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-xs max-h-[400px] overflow-auto border">
                      {typeof result === "string"
                        ? result
                        : JSON.stringify(result, null, 2)}
                    </pre>
                    <CopyButton
                      content={
                        typeof result === "string"
                          ? result
                          : JSON.stringify(result, null, 2)
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ── Helper Functions ──────────────────────────────────────────────
export const isCancelled = (status: any): boolean =>
  status?.type === "incomplete" && status.reason === "cancelled";

export const isLoading = (status: any): boolean => status?.type === "running";
