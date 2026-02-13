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
  list_id: string;
  title: string;
  items: TodoItem[];
}

export interface SSETodoUpdateEvent extends SSEBaseEvent {
  type: "todo_update";
  list_id: string;
  item_id: string;
  completed?: boolean;
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
  | SSEDoneEvent;
