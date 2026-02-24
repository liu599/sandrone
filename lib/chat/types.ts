// ── Todo item type ──────────────────────────────────────────────────
export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

// ── SSE event types ────────────────────────────────────────────────
interface SSEBaseEvent {
  id: string;
  session_id: string;
  conversation_id: string;
  role: "assistant" | "system";
}

export interface SSETextDeltaEvent extends SSEBaseEvent {
  type: "text_delta";
  content: string;
}

export interface SSETextEvent extends SSEBaseEvent {
  type: "text";
  content: string;
}

export interface SSEReasoningEvent extends SSEBaseEvent {
  type: "reasoning";
  content: string;
  status: "thinking" | "done";
}

export interface SSEToolUseEvent extends SSEBaseEvent {
  type: "tool_use";
  tool_use_id: string;
  toolName: string;
  args: unknown;
  status: "running";
}

export interface SSEToolResultEvent extends SSEBaseEvent {
  type: "tool_result";
  tool_use_id: string;
  toolName: string;
  result: unknown;
  status: "completed" | "error";
  error?: string;
}

export interface SSETodoListEvent extends SSEBaseEvent {
  type: "todo_list";
  data: {
    list_id: string;
    items: Array<{
      content: string;
      status: string;
      active_form: string;
    }>;
  };
}

export interface SSETodoUpdateEvent extends SSEBaseEvent {
  type: "todo_update";
  list_id?: string;
  item_id?: string;
  completed?: boolean;
  status?: string;
  text?: string;
}

export interface SSEImageEvent extends SSEBaseEvent {
  type: "image";
  url: string;
  alt?: string;
  mediaType: string;
}

export interface SSEErrorEvent extends SSEBaseEvent {
  type: "error";
  error: string;
  code?: string;
}

export interface SSEDoneEvent extends SSEBaseEvent {
  type: "done";
}

export interface SSESessionIdEvent {
  type: "session_id";
  session_id: string;
}

export interface SSESubAgentEvent extends SSEBaseEvent {
  type: "sub_agent";
  tool_use_id: string;
  data: {
    agentName: string;
    subAgentId: string;
    prompt: string;
    message: string;
  };
}

export interface SSESubAgentEndEvent extends SSEBaseEvent {
  type: "sub_agent_end";
  tool_use_id: string;
  data: {
    message: string;
  };
}

export interface CanvasFile {
  uuid: string;
  filename: string;
  downloadUrl: string;
  fileType: string;
  description?: string;
  module: string;
  createdAt: string;
  modificationsCount?: number;
}

export interface SSEUseCanvasEvent extends SSEBaseEvent {
  type: "use_canvas";
  data: {
    action: "create" | "modify";
    file: CanvasFile;
    message: string;
  };
}

export type SSEEvent =
  | SSETextDeltaEvent
  | SSETextEvent
  | SSEReasoningEvent
  | SSEToolUseEvent
  | SSEToolResultEvent
  | SSETodoListEvent
  | SSETodoUpdateEvent
  | SSEImageEvent
  | SSEErrorEvent
  | SSESubAgentEvent
  | SSESubAgentEndEvent
  | SSEUseCanvasEvent
  | SSEDoneEvent
  | SSESessionIdEvent;
