/**
 * Custom BlockNote equation block for LaTeX/Math equation support.
 * Uses KaTeX for rendering and supports both mathematical and chemical equations.
 */
import React, { useEffect, useRef } from 'react';
import { Edit2 } from 'lucide-react';

export const customEquationPropSchema = {
  textAlignment: { default: 'left' as const },
  backgroundColor: { default: 'transparent' as const },
  latex: { default: '' as const },
  type: { default: 'math' as const },
} as const;

/** Renders the equation using KaTeX. */
const EquationRenderer = ({ block }: { block: any }) => {
  const { latex } = block.props as any;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !latex) return;

    if (typeof window !== 'undefined' && window.katex) {
      try {
        window.katex.render(latex, containerRef.current, {
          displayMode: true,
          throwOnError: false,
          strict: false,
          trust: true,
          macros: {
            "\\ce": "\\mathrm",
          },
        });
      } catch (error) {
        if (containerRef.current) {
          containerRef.current.textContent = latex;
        }
      }
    }
  }, [latex]);

  return (
    <div
      ref={containerRef}
      className="equation-renderer"
      style={{
        padding: '16px',
        textAlign: 'center',
        overflowX: 'auto',
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  );
};

/** Main equation block component. */
const EquationBlockRender = (props: any) => {
  const { block, isSelected, editor } = props;
  const { latex, type } = block.props as any;

  // Handle double-click to edit equation
  const handleDoubleClick = () => {
    if (editor && block) {
      const event = new CustomEvent('inline-equation-edit', {
        detail: {
          inlineContent: block,
          latex: latex || '',
          type: type || 'math',
          isBlockEquation: true,
        },
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div
      contentEditable={false}
      className="bn-equation-block"
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        padding: '0.5rem 0',
      }}
    >
      <EquationRenderer block={block} />
      {(!latex || latex.trim() === '') && (
        <div
          style={{
            padding: '16px',
            textAlign: 'center',
            color: '#999',
            fontStyle: 'italic',
            border: '2px dashed #d9d9d9',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onClick={handleDoubleClick}
        >
          双击编辑公式...
        </div>
      )}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            border: '2px solid #3b82f6',
            pointerEvents: 'none',
            borderRadius: '4px',
          }}
        />
      )}
    </div>
  );
};

export const customEquationBlockConfig = {
  type: 'equation' as const,
  propSchema: customEquationPropSchema,
  content: 'none' as const,
};

export const createCustomEquationBlockSpec = (
  createReactBlockSpec: any,
  // @ts-ignore
) => createReactBlockSpec(customEquationBlockConfig, {
  render: (props: any) => <EquationBlockRender {...props} />,
  slashMenuItem: {
    title: 'Equation',
    group: 'Advanced',
    searchTerms: ['math', 'latex', 'formula', 'chemical'],
    icon: () => <span style={{ fontSize: '18px', fontWeight: 'bold' }}>∑</span>,
    hint: 'Insert math or chemical equation',
    execute: (editor: any) => {
      const newBlock = editor?.createBlock?.({
        type: 'equation',
        props: { latex: '', type: 'math' },
      });
      const position = editor?.getTextCursorPosition?.();
      return editor?.insertBlocks?.([newBlock], position?.block, position?.placement?.after === 'after' ? 'after' : 'before')?.[0];
    },
  },
  sideMenuItem: {
    title: 'Equation',
    group: 'Advanced',
    searchTerms: ['math', 'latex', 'formula', 'chemical'],
    icon: () => <span style={{ fontSize: '18px', fontWeight: 'bold' }}>∑</span>,
    hint: 'Insert math or chemical equation',
    execute: (editor: any) => {
      const newBlock = {
        type: 'equation',
        props: { latex: '', type: 'math' },
        content: [],
        children: [],
      };
      const position = editor?.getTextCursorPosition?.();
      return editor?.insertBlocks?.([newBlock], position?.block, position?.placement?.after === 'after' ? 'after' : 'before')?.[0];
    },
  },
});

export const customEquationBlockSpec = customEquationBlockConfig;
