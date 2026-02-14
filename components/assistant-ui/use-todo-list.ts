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

    const handleTodoItemUpdate = (event: CustomEvent) => {
      const updateData = event.detail;
      console.log("[useTodoList] Received update:", updateData);

      setTodoLists((prev) => {
        console.log("[useTodoList] Current lists:", Array.from(prev.entries()));

        const updated = new Map(prev);
        let foundAndUpdated = false;

        // Update items in all lists
        updated.forEach((list, listId) => {
          // Extract index from item_id like "todo_0" -> index 0, "todo_1" -> index 1, etc.
          const itemIdMatch = updateData.item_id?.match(/todo_(\d+)/);
          let itemIndex = -1;

          if (itemIdMatch) {
            // Item IDs are 0-indexed (todo_0, todo_1, todo_2), use directly
            itemIndex = parseInt(itemIdMatch[1], 10);
          } else {
            // Fallback: try to match by content
            itemIndex = list.items.findIndex((item) =>
              item.content.toLowerCase().includes(updateData.item_id?.toLowerCase() || "")
            );
          }

          console.log(
            "[useTodoList] Looking for",
            updateData.item_id,
            "in list",
            listId,
            "found at index",
            itemIndex,
            "total items",
            list.items.length
          );

          if (itemIndex !== -1 && itemIndex < list.items.length) {
            // Create a new items array with the updated item
            const newItems = [...list.items];
            const newStatus =
              updateData.status || (updateData.completed ? "completed" : list.items[itemIndex].status);

            console.log(
              "[useTodoList] Old status:",
              newItems[itemIndex].status,
              "New status:",
              newStatus
            );

            newItems[itemIndex] = {
              ...list.items[itemIndex],
              status: newStatus,
            };

            // Create a new list object with the updated items
            const updatedList = {
              ...list,
              items: newItems,
            };

            updated.set(listId, updatedList);
            foundAndUpdated = true;

            console.log(
              "[useTodoList] Updated list",
              listId,
              "item",
              itemIndex,
              "to status",
              newStatus
            );
          }
        });

        console.log("[useTodoList] Found and updated:", foundAndUpdated);
        console.log("[useTodoList] Returning updated lists:", Array.from(updated.entries()));

        return updated;
      });
    };

    if (typeof window !== "undefined") {
      window.addEventListener(
        "todo_list_update",
        handleTodoUpdate as EventListener
      );
      window.addEventListener(
        "todo_item_update",
        handleTodoItemUpdate as EventListener
      );

      return () => {
        window.removeEventListener(
          "todo_list_update",
          handleTodoUpdate as EventListener
        );
        window.removeEventListener(
          "todo_item_update",
          handleTodoItemUpdate as EventListener
        );
      };
    }
  }, []);

  return Array.from(todoLists.values());
}
