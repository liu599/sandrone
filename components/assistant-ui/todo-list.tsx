"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { CheckCircle2, Circle, ListTodo, Loader2 } from "lucide-react";
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

// Backend data format
interface BackendTodoItem {
  content: string;
  status: string;
  active_form: string;
}

interface TodoListDataProps {
  data: {
    list_id: string;
    items: BackendTodoItem[];
  };
}

// Tool UI for create_todo_list tool calls
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

// Data component for streaming todo_list events
export const TodoListDataUI = ({ data }: TodoListDataProps) => {
  return (
    <div className="my-3 w-full overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5">
        <ListTodo className="size-4 text-primary" />
        <h3 className="font-medium text-sm">Todo List</h3>
      </div>
      <ul className="divide-y">
        {data.items.map((item, index) => (
          <BackendTodoItemRow key={index} item={item} />
        ))}
      </ul>
    </div>
  );
};

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

function BackendTodoItemRow({ item }: { item: BackendTodoItem }) {
  const isCompleted = item.status === "completed";
  const isInProgress = item.status === "in_progress";

  return (
    <li className="flex items-center gap-3 px-4 py-2.5">
      {isCompleted ? (
        <CheckCircle2 className="size-4 shrink-0 text-primary" />
      ) : isInProgress ? (
        <Loader2 className="size-4 shrink-0 text-blue-500 animate-spin" />
      ) : (
        <Circle className="size-4 shrink-0 text-muted-foreground" />
      )}
      <div className="flex flex-col flex-1">
        <span
          className={cn(
            "text-sm",
            isCompleted && "text-muted-foreground line-through"
          )}
        >
          {item.content}
        </span>
        {isInProgress && item.active_form && (
          <span className="text-xs text-muted-foreground mt-0.5">
            {item.active_form}
          </span>
        )}
      </div>
    </li>
  );
}
