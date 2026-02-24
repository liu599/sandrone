import { Thread } from "@/components/assistant-ui/thread";
import { CanvasSidebar } from "./canvas-sidebar";
import { useCanvasStore } from "@/lib/store/canvas-store";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

function ChatPanelHeader() {
  return (
    <div className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />
      <span className="font-medium text-sm text-foreground">Chat Assistant</span>
    </div>
  );
}

export function SplitThreadWrapper() {
  const isActive = useCanvasStore((s) => s.isActive);

  if (isActive) {
    return (
      <div className="flex h-full w-full overflow-hidden">
        {/* Chat panel — 40% */}
        <div className="flex h-full w-[40%] shrink-0 flex-col bg-white border-r border-gray-200 shadow-sm z-10">
          <ChatPanelHeader />
          <div className="flex-1 overflow-hidden">
            <Thread />
          </div>
        </div>
        {/* Canvas panel — 60% */}
        <CanvasSidebar />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <ChatPanelHeader />
      <div className="flex-1 overflow-hidden">
        <Thread />
      </div>
    </div>
  );
}
