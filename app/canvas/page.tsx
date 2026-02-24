"use client";

import { useState } from "react";
import { CanvasSidebar } from "@/components/assistant-ui/canvas-sidebar";
import { useCanvasStore } from "@/lib/store/canvas-store";

const PRESET_URL =
  "http://speed-1.oss-cn-hangzhou.aliyuncs.com/storage/2026/02/24/56af041ac2b17995102978a578a9884c.md?Expires=1771903151&OSSAccessKeyId=LTAI5tKx47bzLc8Wrhnpd9SP&Signature=vEge3F3G%2FA%2B1y%2FOrAaARqj7Hb0Q%3D";

function Controls() {
  const { openCanvas, closeCanvas, isActive } = useCanvasStore();
  const [url, setUrl] = useState(PRESET_URL);
  const [filename, setFilename] = useState("python_heap_sort_guide.md");

  function open() {
    openCanvas({
      uuid: "debug-" + Date.now(),
      filename,
      downloadUrl: url,
      fileType: filename.split(".").pop() ?? "md",
      description: "Debug canvas file",
      module: "canvas",
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <div className="flex flex-col gap-3 p-4 border-b bg-muted/30">
      <h1 className="font-semibold text-sm">Canvas Debug</h1>
      <div className="flex flex-col gap-2">
        <label className="text-xs text-muted-foreground">Filename</label>
        <input
          className="rounded border px-2 py-1 text-sm bg-background"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs text-muted-foreground">Download URL</label>
        <textarea
          className="rounded border px-2 py-1 text-xs bg-background font-mono resize-none"
          rows={3}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={open}
          className="rounded bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90"
        >
          Open Canvas
        </button>
        {isActive && (
          <button
            onClick={closeCanvas}
            className="rounded border px-3 py-1.5 text-xs hover:bg-muted"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}

export default function CanvasDebugPage() {
  const isActive = useCanvasStore((s) => s.isActive);

  return (
    <div className="flex h-dvh w-full flex-col">
      <Controls />
      <div className="flex flex-1 overflow-hidden">
        {isActive ? (
          <CanvasSidebar />
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Click &quot;Open Canvas&quot; to preview a file
          </div>
        )}
      </div>
    </div>
  );
}
