const AGENT_WS_URL =
  process.env.AGENT_WS_URL || "ws://localhost:10338/agentOS/v1/ws_stream";

export interface AgentStreamCallbacks {
  /** Fires once when the server sends the session_id event */
  onSessionId: (sessionId: string, conversationId: string | null) => void;
  /** Fires for each text chunk from the agent */
  onTextDelta: (text: string) => void;
  /** Fires when the agent signals [DONE] or the socket closes */
  onDone: () => void;
  /** Fires on WebSocket errors */
  onError: (error: Error) => void;
  /** Fires when a sub-agent is invoked */
  onSubAgent?: (data: {
    toolUseId: string;
    agentName: string;
    subAgentId: string;
    prompt: string;
    message: string;
  }) => void;
  /** Fires when a sub-agent returns its result */
  onSubAgentEnd?: (data: {
    toolUseId: string;
    message: string;
  }) => void;
  /** Fires when a todo_list event is received */
  onTodoList?: (data: {
    list_id: string;
    items: Array<{
      content: string;
      status: string;
      active_form: string;
    }>;
  }) => void;
  /** Fires when a todo_update event is received */
  onTodoUpdate?: (data: {
    item_id: string;
    completed?: boolean;
    status?: string;
  }) => void;
}

/**
 * Agent WebSocket message format:
 *
 * 1. Session init:  { type: "session_id", session_id: "...", ... }
 * 2. Text chunk:    { type: "chunk", content: "text...", session_id: "...", conversation_id: "..." }
 * 3. Done signal:   { type: "chunk", content: "[DONE]" }
 */
export function streamAgentMessage(
  content: string,
  token: string | null,
  sessionId: string | null,
  callbacks: AgentStreamCallbacks,
): () => void {
  const ws = new WebSocket(AGENT_WS_URL);
  let done = false;

  ws.addEventListener("open", () => {
    console.log("[AgentStream] Connected to", AGENT_WS_URL);
    ws.send(
      JSON.stringify({
        content,
        token: token || undefined,
        session_id: sessionId || undefined,
      }),
    );
  });

  ws.addEventListener("message", (event) => {
    const raw =
      typeof event.data === "string" ? event.data : String(event.data);

    // Raw [DONE] string (fallback)
    if (raw.trim() === "[DONE]") {
      console.log("[AgentStream] Received raw [DONE]");
      done = true;
      callbacks.onDone();
      ws.close();
      return;
    }

    try {
      const parsed = JSON.parse(raw);

      // ── session_id event ──
      if (parsed.type === "session_id") {
        console.log("[AgentStream] Session:", parsed.session_id);
        callbacks.onSessionId(
          parsed.session_id ?? parsed.id,
          parsed.conversation_id ?? null,
        );
        return;
      }

      // ── chunk event ──
      if (parsed.type === "chunk") {
        // [DONE] inside a chunk = stream finished
        if (parsed.content === "[DONE]") {
          console.log("[AgentStream] Received [DONE] in chunk");
          done = true;
          callbacks.onDone();
          ws.close();
          return;
        }

        // Actual text content
        if (typeof parsed.content === "string" && parsed.content) {
          callbacks.onTextDelta(parsed.content);

          // Also capture conversation_id if present
          if (parsed.conversation_id) {
            callbacks.onSessionId(
              parsed.session_id,
              parsed.conversation_id,
            );
          }
          return;
        }

        // Chunk with no content — ignore
        return;
      }

      // Handle sub_agent event
      if (parsed.type === "sub_agent") {
        console.log("[AgentStream] Sub-agent invoked:", parsed.data?.agentName);
        callbacks.onSubAgent?.({
          toolUseId: parsed.tool_use_id || parsed.data?.subAgentId,
          agentName: parsed.data?.agentName,
          subAgentId: parsed.data?.subAgentId,
          prompt: parsed.data?.prompt,
          message: parsed.data?.message,
        });
        return;
      }

      // Handle sub_agent_end event
      if (parsed.type === "sub_agent_end") {
        console.log("[AgentStream] Sub-agent ended:", parsed.tool_use_id);
        callbacks.onSubAgentEnd?.({
          toolUseId: parsed.tool_use_id,
          message: parsed.data?.message,
        });
        return;
      }

      // Handle todo_list event
      if (parsed.type === "todo_list") {
        console.log("[AgentStream] Todo list received:", parsed.data?.list_id);
        callbacks.onTodoList?.(parsed.data);
        return;
      }

      // Handle todo_update event
      if (parsed.type === "todo_update") {
        console.log("[AgentStream] Todo update received:", parsed.data?.item_id);
        callbacks.onTodoUpdate?.(parsed.data);
        return;
      }

      // ── Unknown event type — log and pass content if available ──
      console.log("[AgentStream] Unknown type:", parsed.type, raw);

      if (typeof parsed.content === "string" && parsed.content) {
        callbacks.onTextDelta(parsed.content);
      }
    } catch {
      // Not JSON — treat as plain text
      if (raw.length > 0) {
        callbacks.onTextDelta(raw);
      }
    }
  });

  ws.addEventListener("error", (event) => {
    console.error("[AgentStream] WebSocket error:", event);
    callbacks.onError(new Error("WebSocket connection error"));
  });

  ws.addEventListener("close", (event) => {
    console.log("[AgentStream] Closed:", event.code, event.reason);
    if (!done) {
      callbacks.onDone();
    }
  });

  return () => {
    if (
      ws.readyState === WebSocket.OPEN ||
      ws.readyState === WebSocket.CONNECTING
    ) {
      ws.close();
    }
  };
}
