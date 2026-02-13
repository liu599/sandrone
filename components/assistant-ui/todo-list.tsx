"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { CheckCircle2, Circle, ListTodo } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoListArgs {
  title: string;
  items: Array<{ text: string; completed?: boolean }>;
}

interface TodoListResult {
  list_id: string;
  title: string;
  items: TodoItem[];
}

export const TodoListUI = makeAssistantToolUI<TodoListArgs, TodoListResult>({
  toolName: "create_todo_list",
  render: ({ args, result, status }) => {
    const items = result?.items ?? args.items ?? [];
    const title = result?.title ?? args.title ?? "Todo List";

    return (
      <div className="my-3 w-full overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5">
          <ListTodo className="size-4 text-primary" />
          <h3 className="font-medium text-sm">{title}</h3>
          {status?.type === "running" && (
            <span className="ml-auto text-muted-foreground text-xs">
              Creating...
            </span>
          )}
        </div>
        <ul className="divide-y">
          {items.map((item, index) => (
            <TodoItemRow
              key={
                "id" in item && typeof item.id === "string"
                  ? item.id
                  : index
              }
              text={item.text}
              initialCompleted={
                "completed" in item ? (item.completed ?? false) : false
              }
            />
          ))}
        </ul>
      </div>
    );
  },
});

function TodoItemRow({
  text,
  initialCompleted,
}: {
  text: string;
  initialCompleted: boolean;
}) {
  const [completed, setCompleted] = useState(initialCompleted);

  return (
    <li
      className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/30"
      onClick={() => setCompleted(!completed)}
    >
      {completed ? (
        <CheckCircle2 className="size-4 shrink-0 text-primary" />
      ) : (
        <Circle className="size-4 shrink-0 text-muted-foreground" />
      )}
      <span
        className={cn(
          "text-sm",
          completed && "text-muted-foreground line-through",
        )}
      >
        {text}
      </span>
    </li>
  );
}
