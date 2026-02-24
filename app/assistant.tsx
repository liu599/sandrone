"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { CustomChatTransport } from "@/lib/chat/custom-chat-transport";
import { SplitThreadWrapper } from "@/components/assistant-ui/split-thread-wrapper";
import {
  TodoListUI,
  SearchKnowledgeBaseUI,
  SubAgentUI,
} from "@/components/assistant-ui/tool-uis";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ThreadListSidebar } from "@/components/assistant-ui/threadlist-sidebar";
import { AuthHydrator } from "@/components/auth/auth-hydrator";
import { useAuthStore } from "@/lib/store/auth-store";
import { MessageSquare } from "lucide-react";
import { useCanvasEvents } from "@/components/assistant-ui/use-canvas-events";

function ChatContent({ children }: { children?: React.ReactNode }) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  if (!hydrated) {
    return null;
  }

  if (!isLoggedIn) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
        <MessageSquare className="size-10 opacity-50" />
        <p className="text-lg font-medium">Please log in to start chatting</p>
        <p className="text-sm">Use the login button in the sidebar</p>
      </div>
    );
  }

  return children || <SplitThreadWrapper />;
}

export const Assistant = ({ children }: { children?: React.ReactNode }) => {
  const runtime = useChatRuntime({
    transport: new CustomChatTransport({ api: "/api/chat" }),
  });

  useCanvasEvents();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AuthHydrator />
      <TodoListUI />
      <SearchKnowledgeBaseUI />
      <SubAgentUI />
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden bg-gray-50">
          <ThreadListSidebar />
          <SidebarInset className="overflow-hidden">
            <div className="flex h-full flex-col overflow-hidden">
              <ChatContent>{children}</ChatContent>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};
