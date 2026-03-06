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
  content?: string; // Cached content for editing
}

interface CanvasStore {
  // Canvas state
  isActive: boolean;
  file: CanvasFile | null;
  error: string | null;
  isLoading: boolean;
  isEditable: boolean; // Whether canvas is in edit mode
  hasUnsavedChanges: boolean; // Whether there are unsaved changes

  // Actions
  openCanvas: (file: CanvasFile) => void;
  updateCanvas: (file: CanvasFile) => void;
  closeCanvas: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setEditable: (editable: boolean) => void;
  setContent: (content: string) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
  saveCanvas: () => Promise<void>;
}

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set, get) => ({
      isActive: false,
      file: null,
      error: null,
      isLoading: false,
      isEditable: false,
      hasUnsavedChanges: false,

      openCanvas: (file) => {
        set({
          isActive: true,
          file,
          error: null,
          isLoading: false,
          isEditable: true, // Default to editable for interactive canvas
          hasUnsavedChanges: false,
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
          isEditable: false,
          hasUnsavedChanges: false,
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

      setEditable: (editable) => {
        set({ isEditable: editable });
      },

      setContent: (content) => {
        set((state) => ({
          file: state.file ? { ...state.file, content } : null,
          hasUnsavedChanges: true,
        }));
      },

      setUnsavedChanges: (hasChanges) => {
        set({ hasUnsavedChanges: hasChanges });
      },

      saveCanvas: async () => {
        const { file, hasUnsavedChanges } = get();
        if (!file || !hasUnsavedChanges) return;

        // Here you would implement the actual save logic
        // For example, calling an API to save the content
        console.log('Saving canvas content:', file.content);
        set({ hasUnsavedChanges: false });
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
