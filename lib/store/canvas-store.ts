import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CanvasFile {
  uuid: string;
  filename: string;
  downloadUrl: string;
  fileType: string;
  description?: string;
  module: string;
  createdAt: string;
  modificationsCount?: number;
}

interface CanvasStore {
  // Canvas state
  isActive: boolean;
  file: CanvasFile | null;
  error: string | null;
  isLoading: boolean;

  // Actions
  openCanvas: (file: CanvasFile) => void;
  updateCanvas: (file: CanvasFile) => void;
  closeCanvas: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set) => ({
      isActive: false,
      file: null,
      error: null,
      isLoading: false,

      openCanvas: (file) => {
        set({
          isActive: true,
          file,
          error: null,
          isLoading: false,
        });
      },

      updateCanvas: (file) => {
        set((state) => ({
          file: {
            ...state.file,
            ...file,
          },
          error: null,
          isLoading: false,
        }));
      },

      closeCanvas: () => {
        set({
          isActive: false,
          file: null,
          error: null,
          isLoading: false,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "canvas-storage",
      // Don't persist canvas state - always start with closed canvas
      storage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      },
    }
  )
);
