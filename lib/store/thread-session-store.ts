import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThreadSessionStore {
  // Map from threadId to sessionId
  threadSessionMap: Record<string, string>;

  // Set sessionId for a thread
  setSessionId: (threadId: string, sessionId: string) => void;

  // Get sessionId for a thread
  getSessionId: (threadId: string) => string | null;

  // Remove sessionId for a thread (when archiving/deleting)
  removeSessionId: (threadId: string) => void;

  // Clear all sessions
  clearAll: () => void;
}

export const useThreadSessionStore = create<ThreadSessionStore>()(
  persist(
    (set, get) => ({
      threadSessionMap: {},

      setSessionId: (threadId, sessionId) => {
        set((state) => ({
          threadSessionMap: {
            ...state.threadSessionMap,
            [threadId]: sessionId,
          },
        }));
      },

      getSessionId: (threadId) => {
        return get().threadSessionMap[threadId] ?? null;
      },

      removeSessionId: (threadId) => {
        set((state) => {
          const { [threadId]: _, ...rest } = state.threadSessionMap;
          return { threadSessionMap: rest };
        });
      },

      clearAll: () => {
        set({ threadSessionMap: {} });
      },
    }),
    {
      name: "thread-session-storage",
    }
  )
);
