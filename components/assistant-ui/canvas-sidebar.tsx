import { useCallback, useState, useEffect } from "react";
import { useCanvasStore, type CanvasFile } from "@/lib/store/canvas-store";
import { FileViewer } from "./file-viewer";
import { BlockNoteEditor } from "@/components/block-note";
import { X, Download, FileText, Edit3, Eye, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Simple native alert replacement for notifications
const showNotification = (message: string) => {
  // For now, just log to console - a proper toast system could be added later
  console.log('Notification:', message);
};

export function CanvasSidebar() {
  const {
    isActive,
    file,
    error,
    isLoading,
    closeCanvas,
    clearError,
    isEditable,
    setEditable,
    setContent,
    hasUnsavedChanges,
    saveCanvas,
    setUnsavedChanges,
  } = useCanvasStore();

  const [fileContent, setFileContent] = useState<string>("");
  const [isContentLoading, setIsContentLoading] = useState(false);

  const isMarkdown = file?.filename.endsWith('.md') || file?.fileType === 'md';

  // Fetch file content for markdown files
  useEffect(() => {
    if (!file || !isMarkdown) return;

    const fetchContent = async () => {
      setIsContentLoading(true);
      try {
        const proxyUrl = `/api/canvas-proxy?url=${encodeURIComponent(file.downloadUrl)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        const text = await response.text();
        setFileContent(text);
        // Sync with store if not already set
        if (!file.content) {
          setContent(text);
        }
      } catch (err) {
        console.error('Failed to fetch file content:', err);
        showNotification('Failed to load file content');
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchContent();
  }, [file, isMarkdown, setContent]);

  const handleDownload = useCallback(() => {
    if (file?.downloadUrl) {
      window.open(file.downloadUrl, "_blank");
    }
  }, [file?.downloadUrl]);

  const handleToggleEdit = () => {
    setEditable(!isEditable);
    showNotification(isEditable ? 'Switched to view mode' : 'Switched to edit mode');
  };

  const handleSave = async () => {
    await saveCanvas();
    showNotification('Content saved successfully');
  };

  const handleContentChange = (newContent: string) => {
    setFileContent(newContent);
    setContent(newContent);
  };

  if (!isActive) return null;

  return (
    <aside className="flex h-full flex-1 flex-col bg-gradient-to-br from-gray-50 to-gray-100 min-w-0">
      {/* Beautiful Toolbar */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200/60 bg-white/80 px-4 shadow-sm backdrop-blur-sm">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20">
            <FileText className="size-4" />
          </div>
          {isLoading && !file ? (
            <Skeleton className="h-5 w-48" />
          ) : file ? (
            <div className="flex min-w-0 flex-col">
              <span
                className="truncate text-sm font-semibold text-foreground"
                title={file.filename}
              >
                {file.filename}
              </span>
              {file.description && (
                <span
                  className="truncate text-xs text-muted-foreground"
                  title={file.description}
                >
                  {file.description}
                </span>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {isMarkdown && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleEdit}
              className="gap-2"
              title={isEditable ? 'Switch to view mode' : 'Switch to edit mode'}
            >
              {isEditable ? (
                <>
                  <Eye className="size-4" />
                  <span className="hidden sm:inline">View</span>
                </>
              ) : (
                <>
                  <Edit3 className="size-4" />
                  <span className="hidden sm:inline">Edit</span>
                </>
              )}
            </Button>
          )}
          {hasUnsavedChanges && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="gap-2 text-blue-600 hover:text-blue-700"
              title="Save changes"
            >
              <Save className="size-4" />
              <span className="hidden sm:inline">Save</span>
            </Button>
          )}
          {file && !isEditable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              title="Download file"
            >
              <Download className="size-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={closeCanvas}
            title="Close canvas (Esc)"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex shrink-0 items-center gap-2 border-b border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <AlertCircle className="size-4" />
          <span className="text-sm">{error}</span>
          <button
            onClick={clearError}
            className="ml-auto text-sm underline hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Document content area */}
      <div className="flex-1 overflow-hidden">
        {isLoading && !file ? (
          <div className="mx-auto flex h-full max-w-3xl items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20 animate-pulse">
                <FileText className="size-6" />
              </div>
              <Skeleton className="h-5 w-48" />
            </div>
          </div>
        ) : file ? (
          <div className="mx-auto h-full w-full max-w-5xl">
            {isMarkdown && isEditable ? (
              // Interactive BlockNoteEditor for markdown files
              <div className="h-full rounded-lg border border-gray-200 bg-white shadow-lg shadow-gray-200/30 overflow-hidden">
                <BlockNoteEditor
                  value={file.content || fileContent}
                  onChange={handleContentChange}
                  editable={true}
                  minHeight={500}
                  assetsMapping={file.uuid ? { [file.uuid]: file.downloadUrl } : {}}
                />
              </div>
            ) : isMarkdown ? (
              // Read-only view for markdown files
              <div className="h-full rounded-lg border border-gray-200 bg-white shadow-lg shadow-gray-200/30 overflow-hidden">
                <div className="flex border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3">
                  <FileText className="mr-2 size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">查看模式</span>
                </div>
                {isContentLoading ? (
                  <div className="flex h-full items-center justify-center p-8">
                    <Skeleton className="h- w-full max-w-md" />
                  </div>
                ) : (
                  <FileViewer file={file} />
                )}
              </div>
            ) : (
              // Non-markdown files use FileViewer
              <div className="h-full rounded-lg border border-gray-200 bg-white shadow-lg shadow-gray-200/30 overflow-hidden">
                <FileViewer file={file} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">No file to display</p>
          </div>
        )}
      </div>

      {/* Unsaved changes indicator */}
      {hasUnsavedChanges && (
        <div className="border-t border-blue-200 bg-blue-50 px-4 py-2 text-center text-sm text-blue-700">
          <span className="inline-flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-blue-500"></span>
            </span>
            You have unsaved changes
          </span>
        </div>
      )}
    </aside>
  );
}
