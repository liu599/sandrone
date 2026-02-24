import { useMemo, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, FileText, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type CanvasFile } from "@/lib/store/canvas-store";

interface FileViewerProps {
  file: CanvasFile;
}

export function FileViewer({ file }: FileViewerProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fileType = useMemo(() => {
    const ext = file.filename.split(".").pop()?.toLowerCase() || "";
    return ext;
  }, [file.filename]);

  const isImage = useMemo(() => {
    return ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(fileType);
  }, [fileType]);

  const isMarkdown = useMemo(() => {
    return fileType === "md";
  }, [fileType]);

  const isCode = useMemo(() => {
    const codeExtensions = [
      "py", "js", "ts", "tsx", "jsx", "java", "cpp", "c", "h",
      "cs", "go", "rs", "rb", "php", "sql", "sh", "bash", "zsh",
      "json", "xml", "yaml", "yml", "toml", "ini", "conf", "cfg",
      "vue", "svelte", "astro", "html", "css", "scss", "less",
    ];
    return codeExtensions.includes(fileType);
  }, [fileType]);

  const isText = useMemo(() => {
    const textExtensions = ["txt", "md", "log", "csv"];
    return textExtensions.includes(fileType);
  }, [fileType]);

  useEffect(() => {
    if (isImage) {
      setLoading(false);
      return;
    }

    async function fetchContent() {
      setLoading(true);
      setError(null);
      try {
        const proxyUrl = `/api/canvas-proxy?url=${encodeURIComponent(file.downloadUrl)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load file content");
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [file.downloadUrl, isImage]);

  function handleDownload() {
    window.open(file.downloadUrl, "_blank");
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2 mt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <AlertCircle className="size-12 text-destructive" />
        <p className="text-center text-sm text-muted-foreground">{error}</p>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          <Download className="size-4" />
          Download File
        </button>
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="flex min-h-[300px] items-center justify-center bg-muted/30 p-4">
        <img
          src={file.downloadUrl}
          alt={file.filename}
          className="max-w-full object-contain"
        />
      </div>
    );
  }

  if (isMarkdown) {
    return (
      <div className="aui-md p-6 text-sm leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    );
  }

  if (isCode || isText) {
    return (
      <pre className="overflow-x-auto bg-muted/30 p-4 text-sm">
        <code className="whitespace-pre-wrap">{content}</code>
      </pre>
    );
  }

  // Unknown file type - show download prompt
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <FileText className="size-12 text-muted-foreground" />
      <div className="text-center">
        <p className="font-medium">{file.filename}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {file.description || "File cannot be previewed"}
        </p>
      </div>
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
      >
        <Download className="size-4" />
        Download File
      </button>
    </div>
  );
}
