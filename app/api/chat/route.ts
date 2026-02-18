import type { UIMessage } from "ai";
import type { SSEEvent } from "@/lib/chat/types";
import { streamAgentMessage } from "@/service/agentStream";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Extract the last user message content
  const lastMessage = messages.filter((m) => m.role === "user").pop();
  const content =
    lastMessage?.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("\n") ?? "";

  // Extract auth token from header
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  // Use the session ID provided by the frontend (from a previous connection),
  // so the backend can restore session memory for this thread.
  const clientSessionId = req.headers.get("X-Session-ID") || null;

  const convId = crypto.randomUUID();

  const baseFields = {
    session_id: clientSessionId ?? crypto.randomUUID(),
    conversation_id: convId,
    role: "assistant" as const,
  };

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let closed = false;

      const emit = (event: SSEEvent) => {
        if (closed) return;
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      const close = () => {
        if (closed) return;
        closed = true;
        controller.close();
      };

      const abort = streamAgentMessage(content, token, clientSessionId, {
        onSessionId: (agentSessionId, agentConvId) => {
          // Update base fields with the real session/conversation IDs
          baseFields.session_id = agentSessionId;
          if (agentConvId) baseFields.conversation_id = agentConvId;
          console.log(
            "[Route] Agent session:",
            agentSessionId,
            "conv:",
            agentConvId,
          );
          // Forward the real session_id to the frontend so it can persist it
          emit({ type: "session_id", session_id: agentSessionId });
        },

        onTextDelta: (text) => {
          emit({
            ...baseFields,
            id: crypto.randomUUID(),
            type: "text_delta",
            content: text,
          });
        },

        onDone: () => {
          emit({
            ...baseFields,
            id: crypto.randomUUID(),
            type: "done",
          });
          close();
        },

        onSubAgent: (data) => {
          emit({
            ...baseFields,
            id: crypto.randomUUID(),
            type: "sub_agent",
            tool_use_id: data.toolUseId,
            data: {
              agentName: data.agentName,
              subAgentId: data.subAgentId,
              prompt: data.prompt,
              message: data.message,
            },
          });
        },

        onSubAgentEnd: (data) => {
          emit({
            ...baseFields,
            id: crypto.randomUUID(),
            type: "sub_agent_end",
            tool_use_id: data.toolUseId,
            data: {
              message: data.message,
            },
          });
        },

        onTodoList: (data) => {
          emit({
            ...baseFields,
            id: crypto.randomUUID(),
            type: "todo_list",
            data: {
              list_id: data.list_id,
              items: data.items,
            },
          });
        },

        onTodoUpdate: (data) => {
          emit({
            ...baseFields,
            id: crypto.randomUUID(),
            type: "todo_update",
            list_id: "default",
            item_id: data.item_id,
            completed: data.completed,
            status: data.status,
          });
        },

        onError: (error) => {
          console.error("[Route] Agent error:", error);
          emit({
            ...baseFields,
            id: crypto.randomUUID(),
            type: "error",
            error: error.message,
          });
          emit({
            ...baseFields,
            id: crypto.randomUUID(),
            type: "done",
          });
          close();
        },
      });

      // If the client disconnects, abort the WebSocket
      req.signal?.addEventListener("abort", () => {
        console.log("[Route] Client disconnected, aborting");
        abort();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
