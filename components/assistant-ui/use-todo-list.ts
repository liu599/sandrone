import { useState, useEffect } from "react";

export interface TodoListData {
  list_id: string;
  items: Array<{
    content: string;
    status: string;
    active_form: string;
  }>;
}

export function useTodoList() {
  const [todoLists, setTodoLists] = useState<Map<string, TodoListData>>(
    new Map()
  );

  useEffect(() => {
    const handleTodoUpdate = (event: CustomEvent) => {
      const todoData: TodoListData = event.detail;
      setTodoLists((prev) => {
        const updated = new Map(prev);
        updated.set(todoData.list_id, todoData);
        return updated;
      });
    };

    if (typeof window !== "undefined") {
      window.addEventListener(
        "todo_list_update",
        handleTodoUpdate as EventListener
      );

      return () => {
        window.removeEventListener(
          "todo_list_update",
          handleTodoUpdate as EventListener
        );
      };
    }
  }, []);

  return Array.from(todoLists.values());
}
