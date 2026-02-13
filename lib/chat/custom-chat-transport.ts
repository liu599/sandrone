import {
  HttpChatTransport,
  type UIMessageChunk,
  type HttpChatTransportInitOptions,
  type UIMessage,
} from "ai";
import type { SSEEvent } from "./types";

export class CustomChatTransport extends HttpChatTransport<UIMessage> {
  constructor(options?: Partial<HttpChatTransportInitOptions<UIMessage>>) {
    super({
      api: "/api/chat",
      headers: (): Record<string, string> => {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("userToken")
            : null;
        if (token) return { Authorization: `Bearer ${token}` };
        return {};
      },
      ...options,
    });
  }

  protected processResponseStream(
    stream: ReadableStream<Uint8Array>,
  ): ReadableStream<UIMessageChunk> {
    let firstEvent = true;
    let textOpen = false;
    let reasoningOpen = false;
    let tId = 0;
    let rId = 0;

    const decoder = new LineDecoder();

    const transform = new TransformStream<Uint8Array, UIMessageChunk>({
      transform(chunk, controller) {
        const lines = decoder.decode(chunk);

        for (const line of lines) {
          if (!line.trim()) continue;

          let event: SSEEvent;
          try {
            event = JSON.parse(line) as SSEEvent;
          } catch {
            continue;
          }

          if (firstEvent) {
            controller.enqueue({ type: "start" });
            controller.enqueue({ type: "start-step" });
            firstEvent = false;
          }

          switch (event.type) {
            case "text_delta": {
              if (!textOpen) {
                const id = `text-${tId++}`;
                controller.enqueue({ type: "text-start", id });
                textOpen = true;
              }
              controller.enqueue({
                type: "text-delta",
                delta: event.content,
                id: `text-${tId - 1}`,
              });
              break;
            }

            case "text": {
              const id = `text-${tId++}`;
              controller.enqueue({ type: "text-start", id });
              controller.enqueue({
                type: "text-delta",
                delta: event.content,
                id,
              });
              controller.enqueue({ type: "text-end", id });
              break;
            }

            case "reasoning": {
              if (event.status === "thinking") {
                if (!reasoningOpen) {
                  const id = `reasoning-${rId++}`;
                  controller.enqueue({ type: "reasoning-start", id });
                  reasoningOpen = true;
                }
                controller.enqueue({
                  type: "reasoning-delta",
                  id: `reasoning-${rId - 1}`,
                  delta: event.content,
                });
              } else if (event.status === "done") {
                if (!reasoningOpen) {
                  const id = `reasoning-${rId++}`;
                  controller.enqueue({ type: "reasoning-start", id });
                  reasoningOpen = true;
                }
                if (event.content) {
                  controller.enqueue({
                    type: "reasoning-delta",
                    id: `reasoning-${rId - 1}`,
                    delta: event.content,
                  });
                }
                controller.enqueue({
                  type: "reasoning-end",
                  id: `reasoning-${rId - 1}`,
                });
                reasoningOpen = false;
              }
              break;
            }

            case "tool_use": {
              controller.enqueue({
                type: "tool-input-available",
                toolCallId: event.tool_use_id,
                toolName: event.toolName,
                input: event.args,
              });
              break;
            }

            case "tool_result": {
              if (event.status === "error") {
                controller.enqueue({
                  type: "tool-output-error",
                  toolCallId: event.tool_use_id,
                  errorText: event.error ?? "Tool execution failed",
                });
              } else {
                controller.enqueue({
                  type: "tool-output-available",
                  toolCallId: event.tool_use_id,
                  output: event.result,
                });
              }
              break;
            }

            case "todo_list": {
              controller.enqueue({
                type: "data-todo_list",
                id: event.list_id,
                data: {
                  list_id: event.list_id,
                  title: event.title,
                  items: event.items,
                },
              } as UIMessageChunk);
              break;
            }

            case "image": {
              controller.enqueue({
                type: "file",
                url: event.url,
                mediaType: event.mediaType,
              });
              break;
            }

            case "error": {
              controller.enqueue({
                type: "error",
                errorText: event.error,
              });
              break;
            }

            case "done": {
              if (textOpen) {
                controller.enqueue({
                  type: "text-end",
                  id: `text-${tId - 1}`,
                });
                textOpen = false;
              }
              if (reasoningOpen) {
                controller.enqueue({
                  type: "reasoning-end",
                  id: `reasoning-${rId - 1}`,
                });
                reasoningOpen = false;
              }
              controller.enqueue({ type: "finish-step" });
              controller.enqueue({ type: "finish" });
              break;
            }
          }
        }
      },

      flush(controller) {
        const remaining = decoder.flush();
        if (remaining.trim()) {
          try {
            const event = JSON.parse(remaining) as SSEEvent;
            if (event.type === "done") {
              if (textOpen) {
                controller.enqueue({
                  type: "text-end",
                  id: `text-${tId - 1}`,
                });
              }
              controller.enqueue({ type: "finish-step" });
              controller.enqueue({ type: "finish" });
            }
          } catch {
            // ignore
          }
        }
      },
    });

    return stream.pipeThrough(transform);
  }
}

class LineDecoder {
  private buffer = "";
  private decoder = new TextDecoder();

  decode(chunk: Uint8Array): string[] {
    this.buffer += this.decoder.decode(chunk, { stream: true });
    const lines: string[] = [];
    let newlineIndex: number;

    while ((newlineIndex = this.buffer.indexOf("\n")) !== -1) {
      lines.push(this.buffer.slice(0, newlineIndex));
      this.buffer = this.buffer.slice(newlineIndex + 1);
    }

    return lines;
  }

  flush(): string {
    const remaining = this.buffer;
    this.buffer = "";
    return remaining;
  }
}
