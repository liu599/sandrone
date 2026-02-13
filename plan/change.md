# Plan: Custom Chat Runtime with Tool Use & Todo List

## Context

The current Lumine chat app uses `@assistant-ui/react-ai-sdk`'s `AssistantChatTransport` + `useChatRuntime` to connect to a standard Vercel AI SDK `/api/chat` endpoint backed by Google Gemini. The user wants to replace this with a fully custom chat runtime that:

1. Uses a **custom SSE protocol** (newline-delimited JSON) instead of the AI SDK stream format
2. Supports **tool_use** (server-side execution, streamed back)
3. Supports **todo_list** as a first-class message type
4. Supports **reasoning**, **images**, and **error** types
5. Is designed to eventually connect to a custom backend

## Approach

Extend `HttpChatTransport` from `ai` package and override `processResponseStream` to parse our custom SSE format into `UIMessageChunk` objects. This reuses the HTTP request logic (POST with messages) while fully customizing the response parsing. On the server, `/api/chat/route.ts` will produce our custom SSE format.

## Files to Create

### 1. `lib/chat/types.ts` — SSE Protocol Types

Define the custom SSE message protocol:

```typescript
// Base fields on every SSE event
interface SSEBaseEvent {
  id: string;
  session_id: string;
  conversation_id: string;
  role: "assistant" | "system";
}

// Event types:
// "text_delta"   — streaming text chunk (content: string)
// "text"         — complete text message (content: string)
// "reasoning"    — thinking content (content: string, status: "thinking" | "done")
// "tool_use"     — tool call initiated (tool_use_id, toolName, args, status: "running")
// "tool_result"  — tool execution result (tool_use_id, toolName, result, status, error)
// "todo_list"    — full todo list (list_id, title, items: TodoItem[])
// "todo_update"  — single item update (list_id, item_id, completed?, text?)
// "image"        — image content (url, alt?, mediaType)
// "error"        — error (error: string, code?: string)
// "done"         — stream complete signal
```

Also define `TodoItem` type and the client request format.

### 2. `lib/chat/custom-chat-transport.ts` — Custom Transport

Extend `HttpChatTransport` from `ai`:

```typescript
import { HttpChatTransport, type UIMessageChunk } from "ai";

export class CustomChatTransport extends HttpChatTransport {
  constructor(options) {
    super({ api: "/api/chat", ...options });
  }

  processResponseStream(stream: ReadableStream<Uint8Array>): ReadableStream<UIMessageChunk> {
    // 1. Decode stream to text lines
    // 2. Parse each line as JSON → SSEEvent
    // 3. Convert to UIMessageChunk:
    //    - First event → emit { type: 'start' } + { type: 'start-step' }
    //    - text_delta → { type: 'text-delta', delta, id }
    //    - text → text-start + text-delta + text-end
    //    - reasoning(thinking) → reasoning-start + reasoning-delta
    //    - reasoning(done) → reasoning-delta + reasoning-end
    //    - tool_use → { type: 'tool-input-available', toolCallId, toolName, input }
    //    - tool_result → { type: 'tool-output-available', toolCallId, output }
    //    - todo_list → { type: 'data-todo_list', data, id }
    //    - image → { type: 'file', url, mediaType }
    //    - error → { type: 'error', errorText }
    //    - done → { type: 'finish-step' } + { type: 'finish' }
  }
}
```

Key: `todo_list` uses AI SDK's `DataUIMessageChunk` (`data-{name}` type) which maps to `DataUIPart` in the message model. This lets us render it with a custom component.

### 3. `app/api/chat/route.ts` — Server Route (Rewrite)

Rewrite to output our custom SSE format:

```typescript
export async function POST(req: Request) {
  const { messages } = await req.json();

  // Create a ReadableStream that outputs newline-delimited JSON
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const sessionId = crypto.randomUUID();
      const convId = crypto.randomUUID();

      // Helper to emit an SSE event
      const emit = (event: SSEEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      // Call Gemini via AI SDK streamText
      const result = streamText({
        model: google("gemini-3-flash-preview"),
        system: "你是月神哥伦比亚...",
        messages: await convertToModelMessages(messages),
        tools: { /* defined tools */ },
      });

      // Convert AI SDK stream to our SSE format
      for await (const part of result.fullStream) {
        if (part.type === 'text-delta') {
          emit({ type: "text_delta", content: part.textDelta, ... });
        } else if (part.type === 'tool-call') {
          emit({ type: "tool_use", ... });
        }
        // ... etc
      }

      emit({ type: "done", ... });
      controller.close();
    }
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" }
  });
}
```

Also define server-side tools using AI SDK's `tool()` function:
- `search_knowledge_base` — searches KB via existing service
- `create_todo_list` — creates a todo list (returns as tool result, transport converts to data part)

### 4. `components/assistant-ui/todo-list.tsx` — Todo List UI Component

A React component registered as a data part renderer or tool UI:

```tsx
export const TodoListUI = makeAssistantToolUI<TodoListArgs, TodoListResult>({
  toolName: "create_todo_list",
  render: ({ args, result, status }) => {
    // Render checklist with title, items, checkboxes
    // Items show text + completed state
    // Interactive checkboxes (visual toggle)
  }
});
```

### 5. `components/assistant-ui/tool-uis.tsx` — Tool UI Registry

Register all custom tool UIs:
- `SearchKnowledgeBaseUI` — shows search query and results
- `TodoListUI` — re-exports from todo-list.tsx
- Export all as an array for easy registration

### 6. Update `app/assistant.tsx` — Use Custom Runtime

```typescript
import { CustomChatTransport } from "@/lib/chat/custom-chat-transport";

const runtime = useChatRuntime({
  transport: new CustomChatTransport({ api: "/api/chat" }),
});

// Register tool UIs inside AssistantRuntimeProvider
<AssistantRuntimeProvider runtime={runtime}>
  <TodoListUI />
  <SearchKnowledgeBaseUI />
  {/* ... rest of layout */}
</AssistantRuntimeProvider>
```

## Files to Modify

| File | Change |
|------|--------|
| `app/assistant.tsx` | Replace `AssistantChatTransport` with `CustomChatTransport`, register tool UIs |
| `app/api/chat/route.ts` | Rewrite to output custom SSE format with tool definitions |
| `components/assistant-ui/thread.tsx` | No changes needed (ToolFallback handles unknown tools) |

## Files to Create

| File | Purpose |
|------|---------|
| `lib/chat/types.ts` | SSE protocol type definitions |
| `lib/chat/custom-chat-transport.ts` | Custom transport extending HttpChatTransport |
| `components/assistant-ui/todo-list.tsx` | Todo list tool UI component |
| `components/assistant-ui/tool-uis.tsx` | Tool UI registry |

## Existing Code to Reuse

- `components/assistant-ui/tool-fallback.tsx` — fallback for unregistered tools
- `service/knowledgeBase.ts` → `searchKnowledgeBase()`, `invertSearch()` — for KB tool
- `lib/utils.ts` → `cn()` — for styling
- `@assistant-ui/react` → `makeAssistantToolUI`, `AssistantRuntimeProvider`
- `ai` → `HttpChatTransport`, `UIMessageChunk`, `streamText`, `tool`

## SSE Protocol Specification

### Request Format (POST /api/chat)
```json
{
  "chatId": "uuid",
  "messages": [UIMessage],
  "trigger": "submit-message" | "regenerate-message"
}
```

### Response Format (newline-delimited JSON)
Each line is a JSON object. Types:

| Type | Key Fields | Description |
|------|-----------|-------------|
| `text_delta` | `content` | Streaming text chunk |
| `text` | `content` | Complete text (non-streaming) |
| `reasoning` | `content`, `status` | Extended thinking |
| `tool_use` | `tool_use_id`, `toolName`, `args` | Tool call initiated |
| `tool_result` | `tool_use_id`, `result`, `error` | Tool execution result |
| `todo_list` | `list_id`, `title`, `items[]` | Todo list creation |
| `image` | `url`, `mediaType` | Image content |
| `error` | `error`, `code` | Error message |
| `done` | — | Stream complete |

### Mapping: Custom SSE → UIMessageChunk

| SSE Event | UIMessageChunk(s) emitted |
|-----------|--------------------------|
| (first event) | `start` → `start-step` |
| `text_delta` | `text-start` (once) → `text-delta` |
| `reasoning(thinking)` | `reasoning-start` → `reasoning-delta` |
| `reasoning(done)` | `reasoning-delta` → `reasoning-end` |
| `tool_use` | `tool-input-available` |
| `tool_result` | `tool-output-available` |
| `todo_list` | `data-todo_list` |
| `image` | `file` |
| `error` | `error` |
| `done` | `text-end` (if text open) → `finish-step` → `finish` |

## Verification

1. `pnpm dev` — app should start without errors
2. Send a chat message → should receive streaming text response in custom SSE format
3. Trigger a tool call (e.g., ask to search knowledge base) → should see tool UI with args and result
4. Ask to create a todo list → should see interactive todo list component
5. Check browser DevTools Network tab → verify `/api/chat` returns newline-delimited JSON (not AI SDK format)
6. Verify reasoning display still works (if model supports it)
