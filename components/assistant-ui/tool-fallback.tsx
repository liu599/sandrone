import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import {
  CheckIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CopyButton,
  ToolDetailsDrawer,
  isCancelled as checkIsCancelled,
  isLoading as checkIsLoading,
} from "@/components/assistant-ui/tool-ui-shared";

export const ToolFallback: ToolCallMessagePartComponent = ({
  toolName,
  argsText,
  result,
  status,
}) => {
  const isCancelledStatus = checkIsCancelled(status);
  const isLoadingStatus = checkIsLoading(status);

  return (
    <div
      className={cn(
        "aui-tool-fallback-root mb-4 flex w-full items-center gap-2 rounded-lg border py-2 px-4 transition-colors",
        isCancelledStatus && "border-muted-foreground/30 bg-muted/30",
      )}
    >
      {isCancelledStatus ? (
        <XCircleIcon className="aui-tool-fallback-icon size-4 text-muted-foreground" />
      ) : isLoadingStatus ? (
        <Loader2Icon className="aui-tool-fallback-icon size-4 animate-spin" />
      ) : (
        <CheckIcon className="aui-tool-fallback-icon size-4 text-green-500" />
      )}
      <p
        className={cn(
          "aui-tool-fallback-title grow text-sm",
          isCancelledStatus && "text-muted-foreground line-through",
        )}
      >
        {isCancelledStatus ? "Cancelled tool: " : isLoadingStatus ? "运行中: " : "已完成: "}
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
