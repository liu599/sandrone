# Canvas Layout Design

## Overview
Design a split-pane layout that displays the chat history on the left and a canvas area on the right when a `use_canvas` websocket message is received from the backend.

## Current Layout
- Chat history is centered with `max-width: 44rem` (`--thread-max-width`)
- Single column layout in `ThreadPrimitive.Root`
- Sidebar on the left for thread list

## New Layout Requirements
1. **Default State**: No canvas - chat remains centered (current behavior)
2. **Active State**: Canvas is shown - layout splits to:
   - Left: Chat history (narrower, but still readable)
   - Right: Canvas area displaying file content

## WebSocket Message Format
```json
{
  "type": "use_canvas",
  "id": "7dac41f4-125b-4045-b2aa-6fa45b84227d",
  "session_id": "...",
  "conversation_id": "...",
  "data": {
    "action": "create" | "modify",
    "file": {
      "uuid": "...",
      "filename": "...",
      "downloadUrl": "http://...",
      "fileType": "md",
      "description": "...",
      "module": "canvas",
      "createdAt": "2026-02-23 23:03:24.336401"
    },
    "message": "..."
  }
}
```

## Architecture

### State Management
Using Zustand for canvas state (similar to existing `thread-session-store`):

```typescript
// lib/store/canvas-store.ts
interface CanvasFile {
  uuid: string;
  filename: string;
  downloadUrl: string;
  fileType: string;
  description: string;
  module: string;
  createdAt: string;
  modificationsCount?: number;
}

interface CanvasStore {
  isActive: boolean;
  file: CanvasFile | null;
  error: string | null;
  isLoading: boolean;
}
```

### WebSocket Integration
Since the current system uses SSE (Server-Sent Events) rather than WebSocket-Socket.IO, we need to handle `use_canvas` events through the existing SSE stream in `CustomChatTransport`.

Update `lib/chat/types.ts`:
```typescript
export interface SSEUseCanvasEvent extends SSEBaseEvent {
  type: "use_canvas";
  data: {
    action: "create" | "modify";
    file: CanvasFile;
    message: string;
  };
}
```

Update `CustomChatTransport.processResponseStream()` to handle `use_canvas` events and emit custom events.

### Layout Components

1. **CanvasSidebar Component** (`components/assistant-ui/canvas-sidebar.tsx`):
   - Displays file content based on file type
   - Download button
   - File metadata display
   - Close button

2. **SplitThread Component** (`components/assistant-ui/split-thread.tsx`):
   - Wraps the existing Thread component
   - Adds canvas sidebar when active
   - Handles responsive layout (collapses on mobile)

3. **File Content Renderers**:
   - Markdown renderer (using existing `MarkdownText`)
   - Code file renderer with syntax highlighting
   - Image viewer
   - Fallback for other types

### Layout Changes

Update `components/assistant-ui/thread.tsx`:
```tsx
// Thread component should support two modes:
// - Centered (default)
// - Split (when canvas is active)
```

The split layout will use CSS Grid:
```css
.split-layout {
  display: grid;
  grid-template-columns: minmax(50%, 600px) 1fr;
}
```

## Implementation Plan

### Step 1: State Management
- Create `lib/store/canvas-store.ts` with Zustand
- Persist state to localStorage for recovery across page reloads

### Step 2: Types Update
- Add `SSEUseCanvasEvent` to `lib/chat/types.ts`
- Add `CanvasFile` interface

### Step 3: WebSocket Handler
- Update `CustomChatTransport` to handle `use_canvas` events
- Dispatch custom events for canvas updates

### Step 4: Canvas Components
- Create `canvas-sidebar.tsx` with file viewer
- Create `file-viewer.tsx` for different file types

### Step 5: Layout Update
- Create `split-thread.tsx` wrapper
- Update `Thread` component to support split mode
- Handle transitions between centered and split layouts

### Step 6: Integration
- Update `app/assistant.tsx` to use SplitThread
- Connect canvas store events

## UX Considerations

1. **Smooth Transitions**: Animate layout changes when canvas opens/closes
2. **Responsive**: Canvas should close on mobile devices (< 768px)
3. **Loading States**: Show skeleton loader while fetching file content
4. **Error Handling**: Display error message if file fails to load
5. **Download**: Always provide download button
6. **Close**: Easy way to close canvas (X button or Escape key)

## File Type Support

| Type | Renderer |
|------|----------|
| `md` | Markdown with code blocks |
| `txt` | Plain text with monospace |
| `py`, `js`, `ts`, etc. | Code with syntax highlighting |
| `png`, `jpg`, `jpeg`, `gif` | Image viewer |
| `pdf` | PDF embed or download prompt |
| other | Download prompt with file info |

## API Endpoints
- No new endpoints required - `downloadUrl` from backend is used directly
- CORS may need to be configured for download URL domain

## Edge Cases
1. Multiple canvas calls: Update existing canvas instead of creating new ones
2. Broken downloadUrl: Show error with retry option
3. Large files: Implement lazy loading or pagination
4. Session persistence: Clear canvas state when thread changes
