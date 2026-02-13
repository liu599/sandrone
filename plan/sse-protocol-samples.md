# Lumine SSE Protocol — WebSocket Message Samples

## Overview

The frontend connects to the backend via WebSocket at `ws://localhost:10338/agentOS/v1/ws_stream`.

**Request:** The frontend sends a single JSON message after connection:
```json
{"content": "用户输入的消息内容"}
```

**Response:** The backend sends a sequence of JSON messages (one per WebSocket frame). Each message must be valid JSON with a `type` field. The stream ends with a `[DONE]` signal.

---

## Message Flow

```
Frontend                         Backend
   │                                │
   │──── WebSocket Connect ────────▶│
   │                                │
   │◀── session_id ─────────────────│  (1) Always first
   │                                │
   │◀── chunk (text) ───────────────│  (2) Streaming text
   │◀── chunk (text) ───────────────│      ... more chunks
   │                                │
   │◀── chunk [DONE] ───────────────│  (N) Always last
   │                                │
   │──── WebSocket Close ──────────▶│
```

---

## Base Fields (required on every message)

```json
{
  "type": "...",
  "id": "uuid",
  "role": "assistant",
  "session_id": "uuid",
  "conversation_id": "uuid | null",
  "tool_use_id": null,
  "content": null,
  "toolName": null,
  "args": null,
  "result": null,
  "status": null,
  "error": null
}
```

---

## 1. `session_id` — Session Initialization

**Must be the first message.** Tells the frontend which session this is.

```json
{
  "type": "session_id",
  "id": "1e0c905e-e7a3-45ca-a553-fe0f179beaef",
  "role": "assistant",
  "session_id": "1e0c905e-e7a3-45ca-a553-fe0f179beaef",
  "conversation_id": null,
  "tool_use_id": null,
  "content": null,
  "toolName": null,
  "args": null,
  "result": null,
  "status": null,
  "error": null
}
```

**Frontend behavior:** Stores session_id internally. Nothing displayed.

---

## 2. `chunk` — Streaming Text Content

Each chunk contains a piece of the assistant's text response. The frontend concatenates all chunks to form the full message.

```json
{
  "type": "chunk",
  "id": "1e0c905e-e7a3-45ca-a553-fe0f179beaef",
  "role": "assistant",
  "session_id": "1e0c905e-e7a3-45ca-a553-fe0f179beaef",
  "conversation_id": "3bcd9447-1abf-4e00-b0d5-0c5f3ab0b7e1",
  "tool_use_id": null,
  "content": "你好",
  "toolName": null,
  "args": null,
  "result": null,
  "status": null,
  "error": null
}
```

Followed by more chunks:
```json
{"type": "chunk", "id": "...", "session_id": "...", "conversation_id": "...", "role": "assistant", "content": "。请问有什么", ...}
{"type": "chunk", "id": "...", "session_id": "...", "conversation_id": "...", "role": "assistant", "content": "我可以帮你的？", ...}
```

**Frontend behavior:** Each chunk's `content` is appended to the chat bubble in real-time (streaming effect).

---

## 3. `chunk` with `[DONE]` — Stream Complete

**Must be the last message.** Signals that the response is finished.

```json
{
  "type": "chunk",
  "id": "1e0c905e-e7a3-45ca-a553-fe0f179beaef",
  "role": "assistant",
  "session_id": "1e0c905e-e7a3-45ca-a553-fe0f179beaef",
  "conversation_id": "3bcd9447-1abf-4e00-b0d5-0c5f3ab0b7e1",
  "tool_use_id": null,
  "content": "[DONE]",
  "toolName": null,
  "args": null,
  "result": null,
  "status": null,
  "error": null
}
```

**Frontend behavior:** Stops the loading spinner. `[DONE]` is NOT displayed to the user.

---

## 4. `reasoning` — Extended Thinking (Optional)

Shows the model's chain-of-thought in a collapsible "Thinking" section.

**Start thinking:**
```json
{
  "type": "reasoning",
  "id": "uuid",
  "role": "assistant",
  "session_id": "...",
  "conversation_id": "...",
  "content": "让我分析一下这个问题...",
  "status": "thinking",
  "tool_use_id": null,
  "toolName": null,
  "args": null,
  "result": null,
  "error": null
}
```

**More thinking (can send multiple):**
```json
{"type": "reasoning", "id": "uuid", "session_id": "...", "conversation_id": "...", "role": "assistant", "content": "首先，我需要考虑...", "status": "thinking", ...}
```

**Done thinking:**
```json
{
  "type": "reasoning",
  "id": "uuid",
  "role": "assistant",
  "session_id": "...",
  "conversation_id": "...",
  "content": "",
  "status": "done",
  "tool_use_id": null,
  "toolName": null,
  "args": null,
  "result": null,
  "error": null
}
```

**Frontend behavior:** Shows a collapsible "Thinking..." section above the response text.

---

## 5. `tool_use` — Tool Call Initiated (Optional)

Tells the frontend that the agent is calling a tool.

```json
{
  "type": "tool_use",
  "id": "uuid",
  "role": "assistant",
  "session_id": "...",
  "conversation_id": "...",
  "tool_use_id": "call-abc123",
  "toolName": "search_knowledge_base",
  "args": {
    "query": "如何部署应用",
    "sourceType": "all"
  },
  "content": null,
  "result": null,
  "status": "running",
  "error": null
}
```

**Frontend behavior:** Shows a "Using tool: search_knowledge_base" card with a loading spinner.

---

## 6. `tool_result` — Tool Execution Result (Optional)

Returns the result of a tool call. Must reference the same `tool_use_id`.

**Success:**
```json
{
  "type": "tool_result",
  "id": "uuid",
  "role": "assistant",
  "session_id": "...",
  "conversation_id": "...",
  "tool_use_id": "call-abc123",
  "toolName": "search_knowledge_base",
  "result": {
    "results": [
      {"title": "部署指南", "content": "使用 docker compose..."}
    ],
    "query": "如何部署应用",
    "total": 1
  },
  "args": null,
  "content": null,
  "status": "completed",
  "error": null
}
```

**Error:**
```json
{
  "type": "tool_result",
  "id": "uuid",
  "role": "assistant",
  "session_id": "...",
  "conversation_id": "...",
  "tool_use_id": "call-abc123",
  "toolName": "search_knowledge_base",
  "result": null,
  "args": null,
  "content": null,
  "status": "error",
  "error": "Knowledge base service unavailable"
}
```

**Frontend behavior:** Replaces the loading spinner with results or error message.

---

## 7. `todo_list` — Create Todo List (Optional)

Creates an interactive checklist in the chat.

```json
{
  "type": "todo_list",
  "id": "uuid",
  "role": "assistant",
  "session_id": "...",
  "conversation_id": "...",
  "list_id": "list-uuid",
  "title": "今日待办事项",
  "items": [
    {"id": "item-1", "text": "完成项目文档", "completed": false},
    {"id": "item-2", "text": "代码审查", "completed": false},
    {"id": "item-3", "text": "团队会议", "completed": true}
  ],
  "tool_use_id": null,
  "content": null,
  "toolName": null,
  "args": null,
  "result": null,
  "status": null,
  "error": null
}
```

**Frontend behavior:** Renders an interactive checklist card. Users can toggle items.

---

## 8. `todo_update` — Update Single Todo Item (Optional)

Updates a single item in an existing todo list.

```json
{
  "type": "todo_update",
  "id": "uuid",
  "role": "assistant",
  "session_id": "...",
  "conversation_id": "...",
  "list_id": "list-uuid",
  "item_id": "item-1",
  "completed": true,
  "text": null,
  "tool_use_id": null,
  "content": null,
  "toolName": null,
  "args": null,
  "result": null,
  "status": null,
  "error": null
}
```

**Frontend behavior:** Toggles the checkbox of that specific item.

---

## 9. `image` — Image Content (Optional)

Sends an image to display in the chat.

```json
{
  "type": "image",
  "id": "uuid",
  "role": "assistant",
  "session_id": "...",
  "conversation_id": "...",
  "url": "https://example.com/chart.png",
  "mediaType": "image/png",
  "alt": "销售数据图表",
  "tool_use_id": null,
  "content": null,
  "toolName": null,
  "args": null,
  "result": null,
  "status": null,
  "error": null
}
```

**Frontend behavior:** Renders the image inline in the chat message.

---

## 10. `error` — Error Message (Optional)

Displays an error banner to the user.

```json
{
  "type": "error",
  "id": "uuid",
  "role": "assistant",
  "session_id": "...",
  "conversation_id": "...",
  "error": "模型服务暂时不可用，请稍后重试",
  "code": "MODEL_UNAVAILABLE",
  "tool_use_id": null,
  "content": null,
  "toolName": null,
  "args": null,
  "result": null,
  "status": null
}
```

**Frontend behavior:** Shows a red error banner below the message.

---

## Full Conversation Example

A complete interaction where the user asks to search and create a todo:

```
→ Frontend sends: {"content": "帮我搜索部署文档，然后创建一个部署清单"}

← 1. session_id
{"type":"session_id","id":"ses-001","role":"assistant","session_id":"ses-001","conversation_id":null,...}

← 2. reasoning (thinking)
{"type":"reasoning","id":"r-001","role":"assistant","session_id":"ses-001","conversation_id":"conv-001","content":"用户想要搜索文档并创建清单，我先搜索知识库...","status":"thinking",...}

← 3. reasoning (done)
{"type":"reasoning","id":"r-002","role":"assistant","session_id":"ses-001","conversation_id":"conv-001","content":"","status":"done",...}

← 4. tool_use (search)
{"type":"tool_use","id":"t-001","role":"assistant","session_id":"ses-001","conversation_id":"conv-001","tool_use_id":"call-001","toolName":"search_knowledge_base","args":{"query":"部署文档"},"status":"running",...}

← 5. tool_result (search results)
{"type":"tool_result","id":"t-002","role":"assistant","session_id":"ses-001","conversation_id":"conv-001","tool_use_id":"call-001","toolName":"search_knowledge_base","result":{"results":[{"title":"部署指南"}],"total":1},"status":"completed",...}

← 6. chunk (text)
{"type":"chunk","id":"c-001","role":"assistant","session_id":"ses-001","conversation_id":"conv-001","content":"根据知识库的文档，我为你创建了以下部署清单：",...}

← 7. todo_list
{"type":"todo_list","id":"td-001","role":"assistant","session_id":"ses-001","conversation_id":"conv-001","list_id":"list-001","title":"部署清单","items":[{"id":"i-1","text":"准备 Docker 环境","completed":false},{"id":"i-2","text":"配置环境变量","completed":false},{"id":"i-3","text":"运行 docker compose up","completed":false}],...}

← 8. chunk (more text)
{"type":"chunk","id":"c-002","role":"assistant","session_id":"ses-001","conversation_id":"conv-001","content":"按照以上步骤操作即可完成部署。",...}

← 9. [DONE]
{"type":"chunk","id":"c-003","role":"assistant","session_id":"ses-001","conversation_id":"conv-001","content":"[DONE]",...}
```

---

## Minimum Viable Implementation

For basic text chat, the backend only needs to send **3 message types**:

1. `session_id` → once at start
2. `chunk` with `content` → one or more text chunks
3. `chunk` with `content: "[DONE]"` → once at end

All other types (`reasoning`, `tool_use`, `tool_result`, `todo_list`, `image`, `error`) are optional and can be added incrementally.
