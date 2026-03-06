/**
 * Beautiful interactive BlockNoteEditor for canvas display in Lumine.
 * Supports markdown editing with math equations and images.
 */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import EquationModal from './equation-modal';
import {
  customEquationPropSchema,
  customImagePropSchema,
} from './custom-equation-block';
import { customImagePropSchema as customImagePropSchemaType } from './custom-image-block';
import { parseMarkdownToBlocks, serializeBlocksToMarkdown } from './markdown-utils';

// Types for the editor
export interface BlockNoteEditorProps {
  /** Initial markdown content */
  value?: string;
  /** Called when content changes */
  onChange?: (value: string) => void;
  /** Whether the editor is editable */
  editable?: boolean;
  /** Minimum height */
  minHeight?: number;
  /** Custom assets mapping for images */
  assetsMapping?: Record<string, string>;
}

// Placeholder component - BlockNote will be loaded dynamically
const BlockNoteEditor: React.FC<BlockNoteEditorProps> = ({
  value = '',
  onChange,
  editable = true,
  minHeight = 400,
  assetsMapping = {},
}) => {
  const [isClient, setIsClient] = useState(false);
  const [equationModalVisible, setEquationModalVisible] = useState(false);
  const [pendingBlockForEquation, setPendingBlockForEquation] = useState<any>(null);
  const [editingInlineEquation, setEditingInlineEquation] = useState<any>(null);
  const [editor, setEditor] = useState<any>(null);
  const [BlockNoteView, setBlockNoteView] = useState<any>(null);
  const [SuggestionMenuController, setSuggestionMenuController] = useState<any>(null);
  const [useCreateBlockNote, setUseCreateBlockNote] = useState<any>(null);
  const isInitializing = useRef(true);
  const lastEmittedRef = useRef<string | undefined>(undefined);
  const lastLoadedRef = useRef<string | undefined>(undefined);
  const lastAssetsMappingRef = useRef<Record<string, string>>(assetsMapping);

  // Dynamically load BlockNote dependencies
  useEffect(() => {
    setIsClient(true);

    const loadBlockNote = async () => {
      try {
        const [
          { default: MantineStyles },
          { BlockNoteSchema, defaultBlockSpecs, defaultInlineContentSpecs },
          { filterSuggestionItems, insertOrUpdateBlockForSlashMenu },
          { BlockNoteView: BNView },
          {
            useCreateBlockNote: uCBN,
            SuggestionMenuController: SMC,
            getDefaultReactSlashMenuItems,
            DefaultReactSuggestionItem,
          },
          { createReactBlockSpec, createReactInlineContentSpec },
          katex,
        ] = await Promise.all([
          import('@blocknote/mantine/style.css'),
          import('@blocknote/core'),
          import('@blocknote/core/extensions'),
          import('@blocknote/mantine'),
          import('@blocknote/react'),
          import('@blocknote/react'),
          import('katex'),
        ]);

        // Make katex available globally
        if (typeof window !== 'undefined') {
          (window as any).katex = katex;
          await import('katex/dist/katex.min.css');
        }

        setBlockNoteView(() => BNView);
        setSuggestionMenuController(() => SMC);
        setUseCreateBlockNote(() => uCBN);

      } catch (error) {
        console.error('Failed to load BlockNote:', error);
      }
    };

    loadBlockNote();
  }, []);

  // Create editor once dependencies are loaded
  useEffect(() => {
    if (!useCreateBlockNote || !isClient) return;

    const createEditor = async () => {
      try {
        const [
          { BlockNoteSchema, defaultBlockSpecs },
          { createReactBlockSpec },
          { customEquationBlockConfig },
          { customImageBlockConfig },
        ] = await Promise.all([
          import('@blocknote/core'),
          import('@blocknote/react'),
          import('./custom-equation-block'),
          import('./custom-image-block'),
        ]);

        // Create custom block specs
        const createCustomEquationSpec = createReactBlockSpec(customEquationBlockConfig, {
          render: (props: any) => {
            const { default: EquationBlockRender } = require('./custom-equation-block');
            return <EquationBlockRender {...props} />;
          },
        });

        const createCustomImageSpec = createReactBlockSpec(customImageBlockConfig, {
          meta: { fileBlockAccept: ['image/*'] },
          render: (props: any) => {
            const { default: ImageBlockRender } = require('./custom-image-block');
            return <ImageBlockRender {...props} />;
          },
          parse: (element: HTMLElement) => {
            if (element.tagName === 'IMG') {
              return {
                url: (element as HTMLImageElement).src || '',
                caption: element.getAttribute('alt') || '',
                name: element.getAttribute('alt') || '',
                textAlignment: 'center',
              };
            }
            return undefined;
          },
        });

        const editorSchema = BlockNoteSchema?.create?.({
          blockSpecs: {
            ...defaultBlockSpecs(),
            image: createCustomImageSpec,
            equation: createCustomEquationSpec,
          },
        });

        const createdEditor = useCreateBlockNote({
          schema: editorSchema,
          uploadFile: async (file: File) => {
            // Convert file to data URL for simplicity
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                resolve({
                  props: {
                    url: e.target?.result as string,
                    name: file.name,
                    caption: '',
                  },
                });
              };
              reader.readAsDataURL(file);
            });
          },
        });

        setEditor(createdEditor);
      } catch (error) {
        console.error('Failed to create editor:', error);
      }
    };

    createEditor();
  }, [useCreateBlockNote, isClient]);

  // Load markdown content
  useEffect(() => {
    if (!editor || !value) return;

    if (lastEmittedRef.current === value) {
      return;
    }

    if (lastAssetsMappingRef.current !== assetsMapping) {
      lastAssetsMappingRef.current = assetsMapping;
      lastLoadedRef.current = undefined;
    }

    if (lastLoadedRef.current === value) {
      return;
    }
    lastLoadedRef.current = value;

    isInitializing.current = true;

    const loadContent = async () => {
      try {
        const blocks = parseMarkdownToBlocks(editor, value, assetsMapping);
        editor.replaceBlocks(editor.document, blocks);
        setTimeout(() => {
          isInitializing.current = false;
        }, 100);
      } catch (error) {
        console.error('Failed to load content:', error);
        setTimeout(() => {
          isInitializing.current = false;
        }, 100);
      }
    };

    loadContent();
  }, [editor, value, assetsMapping]);

  // Handle changes
  const handleChange = async () => {
    if (isInitializing.current || !editor || !onChange) return;

    const { markdown } = serializeBlocksToMarkdown(editor, editor.document);
    lastEmittedRef.current = markdown;
    onChange(markdown);
  };

  // Handle equation editing
  useEffect(() => {
    const handleInlineEquationEdit = (e: any) => {
      if (e.detail.isBlockEquation) {
        setEditingInlineEquation({
          id: e.detail.inlineContent.id,
          isBlockEquation: true,
          props: { latex: e.detail.latex, type: e.detail.type },
        });
      } else {
        setEditingInlineEquation(e.detail.inlineContent);
      }
      setEquationModalVisible(true);
    };

    window.addEventListener('inline-equation-edit', handleInlineEquationEdit);
    return () => {
      window.removeEventListener('inline-equation-edit', handleInlineEquationEdit);
    };
  }, []);

  // Monitor for new equation blocks
  useEffect(() => {
    if (!editor) return;

    const unsubscribe = editor.onChange(() => {
      if (isInitializing.current) return;

      const equationBlocks = editor.document.filter((b: any) => b.type === 'equation');
      equationBlocks.forEach((block: any) => {
        if (block.props?.latex === '' && !equationModalVisible && !pendingBlockForEquation) {
          setPendingBlockForEquation(block);
          setEquationModalVisible(true);
        }
      });
    });

    return unsubscribe;
  }, [editor, equationModalVisible, pendingBlockForEquation]);

  const handleEquationConfirm = (latex: string, type: 'math' | 'chemistry') => {
    if (editingInlineEquation && editor) {
      if (editingInlineEquation.isBlockEquation && editingInlineEquation.id) {
        editor.updateBlock(editingInlineEquation, {
          type: 'equation',
          props: { latex, type },
        });
      }
      setEditingInlineEquation(null);
    } else if (pendingBlockForEquation && editor) {
      editor.updateBlock(pendingBlockForEquation, {
        type: 'equation',
        props: { latex, type },
      });
      setPendingBlockForEquation(null);
    }
    setEquationModalVisible(false);
  };

  const handleEquationCancel = () => {
    if (pendingBlockForEquation && editor) {
      try {
        editor.removeBlocks([pendingBlockForEquation]);
      } catch {
        // Block may have been removed already
      }
    }
    setEquationModalVisible(false);
    setPendingBlockForEquation(null);
    setEditingInlineEquation(null);
  };

  if (!isClient || !BlockNoteView || !editor) {
    return (
      <div
        className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8"
        style={{ minHeight }}
      >
        <Sparkles className="size-8 text-primary animate-pulse" />
        <p className="mt-4 text-sm text-muted-foreground">正在加载编辑器...</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col">
      {/* Beautiful header */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 dark:from-gray-800 dark:to-gray-900">
        <FileText className="size-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          {editable ? '交互式编辑' : '查看模式'}
        </span>
      </div>

      {/* Editor */}
      <div
        className="flex-1 overflow-hidden"
        style={{
          minHeight: minHeight - 50,
        }}
      >
        <BlockNoteView
          className="bn-editor-enhanced min-h-full"
          editor={editor}
          editable={editable}
          onChange={handleChange}
          slashMenu
        />
      </div>

      {/* Equation Modal */}
      <EquationModal
        visible={equationModalVisible}
        onConfirm={handleEquationConfirm}
        onClose={handleEquationCancel}
        initialLatex={
          editingInlineEquation?.isBlockEquation
            ? editingInlineEquation?.props?.latex || ''
            : editingInlineEquation?.props?.latex || pendingBlockForEquation?.props?.latex || ''
        }
        initialType={
          editingInlineEquation?.isBlockEquation
            ? editingInlineEquation?.props?.type || 'math'
            : editingInlineEquation?.props?.type || pendingBlockForEquation?.props?.type || 'math'
        }
      />
    </div>
  );
};

export default BlockNoteEditor;
