import { useEffect, useCallback } from "react";
import { useCanvasStore } from "@/lib/store/canvas-store";
import type { CanvasFile } from "@/lib/store/canvas-store";

interface CanvasEventData {
  action: "create" | "modify";
  file: CanvasFile;
  message: string;
}

export function useCanvasEvents() {
  const openCanvas = useCanvasStore((state) => state.openCanvas);
  const updateCanvas = useCanvasStore((state) => state.updateCanvas);

  const handleCanvasEvent = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<CanvasEventData>;
    const { action, file } = customEvent.detail;

    console.log("[useCanvasEvents] Received use_canvas event:", { action, file });

    if (action === "create") {
      openCanvas(file);
    } else if (action === "modify") {
      updateCanvas(file);
    }
  }, [openCanvas, updateCanvas]);

  useEffect(() => {
    window.addEventListener("use_canvas", handleCanvasEvent);
    return () => {
      window.removeEventListener("use_canvas", handleCanvasEvent);
    };
  }, [handleCanvasEvent]);
}
