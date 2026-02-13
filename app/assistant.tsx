"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { CustomChatTransport } from "@/lib/chat/custom-chat-transport";
import { Thread } from "@/components/assistant-ui/thread";
import {
  TodoListUI,
  SearchKnowledgeBaseUI,
} from "@/components/assistant-ui/tool-uis";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThreadListSidebar } from "@/components/assistant-ui/threadlist-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { AuthHydrator } from "@/components/auth/auth-hydrator";
import { useAuthStore } from "@/lib/store/auth-store";
import { MessageSquare } from "lucide-react";

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

  return children || <Thread />;
}

export const Assistant = ({ children }: { children?: React.ReactNode }) => {
  const runtime = useChatRuntime({
    transport: new CustomChatTransport({ api: "/api/chat" }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AuthHydrator />
      <TodoListUI />
      <SearchKnowledgeBaseUI />
      <SidebarProvider>
        <div className="flex h-dvh w-full pr-0.5">
          <ThreadListSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Chat Assistant</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className="flex-1 overflow-hidden">
              <ChatContent>{children}</ChatContent>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};
