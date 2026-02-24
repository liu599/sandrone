import { useCallback } from "react";
import { useCanvasStore, type CanvasFile } from "@/lib/store/canvas-store";
import { FileViewer } from "./file-viewer";
import { X, Download, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export function CanvasSidebar() {
  const { isActive, file, error, isLoading, closeCanvas, clearError } =
    useCanvasStore();

  const handleDownload = useCallback(() => {
    if (file?.downloadUrl) {
      window.open(file.downloadUrl, "_blank");
    }
  }, [file?.downloadUrl]);

  if (!isActive) return null;

  return (
    <aside className="flex h-full flex-1 flex-col bg-gray-100 min-w-0">
      {/* Toolbar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4 shadow-sm">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="shrink-0 size-4 text-primary" />
          {isLoading && !file ? (
            <Skeleton className="h-4 w-40" />
          ) : file ? (
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="truncate text-sm font-medium text-foreground"
                title={file.filename}
              >
                {file.filename}
              </span>
              {file.description && (
                <span
                  className="hidden truncate text-xs text-muted-foreground lg:block"
                  title={file.description}
                >
                  — {file.description}
                </span>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {file && (
            <button
              onClick={handleDownload}
              className="rounded-md p-2 text-muted-foreground hover:bg-gray-100 hover:text-foreground"
              title="Download file"
            >
              <Download className="size-4" />
            </button>
          )}
          <button
            onClick={closeCanvas}
            className="rounded-md p-2 text-muted-foreground hover:bg-gray-100 hover:text-foreground"
            title="Close canvas (Esc)"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex shrink-0 items-center gap-2 border-b bg-destructive/10 px-4 py-2 text-destructive">
          <AlertCircle className="size-4" />
          <span className="text-sm">{error}</span>
          <button
            onClick={clearError}
            className="ml-auto text-sm underline hover:text-destructive/80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Document content area */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading && !file ? (
          <div className="mx-auto w-full max-w-3xl space-y-6">
            <div className="aspect-[1/1.4] w-full rounded-sm border border-gray-200 bg-white shadow-md p-8 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        ) : file ? (
          <div className="mx-auto w-full max-w-3xl">
            <div className="w-full rounded-sm border border-gray-200 bg-white shadow-md overflow-hidden">
              <FileViewer file={file} />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">No file to display</p>
          </div>
        )}
      </div>
    </aside>
  );
}
