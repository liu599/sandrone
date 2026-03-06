/**
 * Equation input modal for BlockNote editor.
 * Provides predefined mathematical and chemical equations with real-time preview.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

/**
 * Renders a single math symbol using KaTeX for display in buttons.
 */
const RenderedSymbol: React.FC<{ latex: string }> = ({ latex }) => {
  const [renderedHtml, setRenderedHtml] = React.useState<string>('');

  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.katex) {
        setRenderedHtml(window.katex.renderToString(latex, {
          displayMode: false,
          throwOnError: false,
          strict: false,
          trust: true,
        }));
      }
    } catch {
      setRenderedHtml(latex);
    }
  }, [latex]);

  return <span dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
};

// Predefined mathematical equations
const MATH_FORMULAS = [
  { name: '二次方程', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
  { name: '微积分积分', latex: '\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)' },
  { name: '勾股定理', latex: 'a^2 + b^2 = c^2' },
  { name: '欧拉公式', latex: 'e^{i\\pi} + 1 = 0' },
  { name: '极限', latex: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1' },
  { name: '求和公式', latex: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}' },
  { name: '泰勒级数', latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x-a)^n' },
  { name: '高斯分布', latex: '\\phi(x) = \\frac{1}{\\sqrt{2\\pi\\sigma^2}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}' },
];

// Predefined chemical equations
const CHEMISTRY_FORMULAS = [
  { name: '水分子', latex: 'H_2O' },
  { name: '光合作用', latex: '6CO_2 + 6H_2O \\xrightarrow{light} C_6H_{12}O_6 + 6O_2' },
  { name: '燃烧反应', latex: 'CH_4 + 2O_2 \\rightarrow CO_2 + 2H_2O' },
  { name: '中和反应', latex: 'HCl + NaOH \\rightarrow NaCl + H_2O' },
  { name: '氧化还原', latex: '2Na + Cl_2 \\rightarrow 2NaCl' },
  { name: '分解反应', latex: '2H_2O \\xrightarrow{electrolysis} 2H_2 + O_2' },
  { name: '配位化合物', latex: '[Cu(NH_3)_4]^{2+}' },
];

// Greek letters (simplified subset)
const GREEK_LETTERS = [
  { symbol: '\\alpha', name: 'Alpha' },
  { symbol: '\\beta', name: 'Beta' },
  { symbol: '\\gamma', name: 'Gamma' },
  { symbol: '\\delta', name: 'Delta' },
  { symbol: '\\epsilon', name: 'Epsilon' },
  { symbol: '\\theta', name: 'Theta' },
  { symbol: '\\lambda', name: 'Lambda' },
  { symbol: '\\mu', name: 'Mu' },
  { symbol: '\\pi', name: 'Pi' },
  { symbol: '\\sigma', name: 'Sigma' },
  { symbol: '\\phi', name: 'Phi' },
  { symbol: '\\omega', name: 'Omega' },
];

// Math operators
const MATH_OPERATORS = [
  { symbol: '+', name: 'Plus' },
  { symbol: '-', name: 'Minus' },
  { symbol: '\\times', name: 'Times' },
  { symbol: '\\div', name: 'Divide' },
  { symbol: '\\pm', name: 'Plus minus' },
  { symbol: '=', name: 'Equals' },
  { symbol: '\\neq', name: 'Not equal' },
  { symbol: '<', name: 'Less' },
  { symbol: '>', name: 'Greater' },
  { symbol: '\\leq', name: 'Less equal' },
  { symbol: '\\geq', name: 'Greater equal' },
  { symbol: '\\approx', name: 'Approx' },
];

// Calculus symbols
const CALCULUS_SYMBOLS = [
  { symbol: '\\infty', name: 'Infinity' },
  { symbol: '\\int', name: 'Integral' },
  { symbol: '\\sum', name: 'Sum' },
  { symbol: '\\prod', name: 'Product' },
  { symbol: '\\lim', name: 'Limit' },
  { symbol: '\\sqrt', name: 'Sqrt' },
  { symbol: '\\partial', name: 'Partial' },
  { symbol: '\\nabla', name: 'Nabla' },
];

// Functions
const FUNCTIONS = [
  { symbol: '\\sin', name: 'Sine' },
  { symbol: '\\cos', name: 'Cosine' },
  { symbol: '\\tan', name: 'Tangent' },
  { symbol: '\\log', name: 'Log' },
  { symbol: '\\ln', name: 'Natural log' },
  { symbol: '\\exp', name: 'Exponential' },
];

export interface EquationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (latex: string, type: 'math' | 'chemistry') => void;
  initialLatex?: string;
  initialType?: 'math' | 'chemistry';
}

const EquationModal: React.FC<EquationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialLatex = '',
  initialType = 'math',
}) => {
  const [latex, setLatex] = useState(initialLatex);
  const [previewError, setPreviewError] = useState(false);
  const [quickInputMode, setQuickInputMode] = useState<string>('basic');
  const [formulaType, setFormulaType] = useState<string>(initialType);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Update latex when initialLatex changes
  useEffect(() => {
    setLatex(initialLatex);
    setFormulaType(initialType);
  }, [initialLatex, initialType]);

  // Render preview using KaTeX
  useEffect(() => {
    if (previewRef.current && typeof window !== 'undefined' && window.katex) {
      previewRef.current.innerHTML = '';

      if (latex.trim()) {
        try {
          window.katex.render(latex, previewRef.current, {
            displayMode: true,
            throwOnError: false,
            strict: false,
            trust: true,
          });
          setPreviewError(false);
        } catch (error) {
          setPreviewError(true);
          if (previewRef.current) {
            previewRef.current.textContent = latex;
          }
        }
      }
    }
  }, [latex]);

  const insertSymbol = (symbol: string) => {
    const textArea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textArea) {
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const value = textArea.value;
      const newValue = value.slice(0, start) + symbol + value.slice(end);
      setLatex(newValue);

      setTimeout(() => {
        textArea.focus();
        const newCursorPos = start + symbol.length;
        textArea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    } else {
      setLatex((prev) => prev + symbol);
    }
  };

  const handleFormulaClick = (formulaLatex: string, type: 'math' | 'chemistry') => {
    setLatex(formulaLatex);
    setFormulaType(type);
  };

  const handleConfirm = () => {
    if (latex.trim()) {
      onConfirm(latex, formulaType as 'math' | 'chemistry');
      setLatex('');
      setPreviewError(false);
    }
  };

  const handleCancel = () => {
    onClose();
    setLatex('');
    setPreviewError(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-xl bg-white shadow-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">插入公式</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            取消
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {/* Formula Input */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-foreground">
              输入公式（支持数学和化学）：
            </label>
            <Input
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              placeholder="输入 LaTeX 公式，数学: E = mc^2，化学: H_2O"
              className="font-mono"
            />
          </div>

          {/* Preview */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-foreground">
              实时预览：
            </label>
            <div
              ref={previewRef}
              className="flex min-h-[80px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 dark:border-gray-800 dark:bg-gray-950"
            >
              {!latex.trim() && (
                <span className="text-sm text-muted-foreground">
                  输入公式以预览
                </span>
              )}
            </div>
          </div>

          {/* Quick Input */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-foreground">
              快捷输入：
            </label>

            <div className="mb-3 flex flex-wrap gap-2">
              {['basic', 'greek', 'operators', 'calculus', 'functions'].map((mode) => (
                <Button
                  key={mode}
                  variant={quickInputMode === mode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setQuickInputMode(mode)}
                >
                  {mode === 'basic' && '基础符号'}
                  {mode === 'greek' && '希腊字母'}
                  {mode === 'operators' && '运算符'}
                  {mode === 'calculus' && '微积分'}
                  {mode === 'functions' && '函数'}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
              {quickInputMode === 'basic' && GREEK_LETTERS.map((item) => (
                <Button
                  key={item.symbol}
                  variant="ghost"
                  size="sm"
                  onClick={() => insertSymbol(item.symbol)}
                  title={item.name}
                  className="h-10 px-3"
                >
                  <RenderedSymbol latex={item.symbol} />
                </Button>
              ))}
              {quickInputMode === 'greek' && GREEK_LETTERS.map((item) => (
                <Button
                  key={item.symbol}
                  variant="ghost"
                  size="sm"
                  onClick={() => insertSymbol(item.symbol)}
                  title={item.name}
                  className="h-10 px-3"
                >
                  <RenderedSymbol latex={item.symbol} />
                </Button>
              ))}
              {quickInputMode === 'operators' && MATH_OPERATORS.map((item) => (
                <Button
                  key={item.symbol}
                  variant="ghost"
                  size="sm"
                  onClick={() => insertSymbol(item.symbol)}
                  title={item.name}
                  className="h-10 px-3"
                >
                  <RenderedSymbol latex={item.symbol} />
                </Button>
              ))}
              {quickInputMode === 'calculus' && CALCULUS_SYMBOLS.map((item) => (
                <Button
                  key={item.symbol}
                  variant="ghost"
                  size="sm"
                  onClick={() => insertSymbol(item.symbol)}
                  title={item.name}
                  className="h-10 px-4"
                >
                  <RenderedSymbol latex={item.symbol} />
                </Button>
              ))}
              {quickInputMode === 'functions' && FUNCTIONS.map((item) => (
                <Button
                  key={item.symbol}
                  variant="ghost"
                  size="sm"
                  onClick={() => insertSymbol(item.symbol)}
                  title={item.name}
                  className="h-10 px-4"
                >
                  <span className="font-serif">{item.symbol}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Predefined Formulas */}
          <Collapsible
            open={expandedSection === 'predefined'}
            onOpenChange={(open) => setExpandedSection(open ? 'predefined' : null)}
            className="rounded-lg border border-gray-200 dark:border-gray-800"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full items-center justify-between rounded-none px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <span className="font-medium">预定义公式</span>
                {expandedSection === 'predefined' ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-t border-gray-200 dark:border-gray-800">
                <div className="flex gap-2 border-b border-gray-200 bg-gray-50 px-4 dark:bg-gray-900 dark:border-gray-800">
                  <button
                    className={`px-4 py-3 text-sm font-medium transition-colors ${
                      expandedSection === 'math' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                    }`}
                    onClick={() => setExpandedSection('math')}
                  >
                    数学公式
                  </button>
                  <button
                    className={`px-4 py-3 text-sm font-medium transition-colors ${
                      expandedSection === 'chemistry' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                    }`}
                    onClick={() => setExpandedSection('chemistry')}
                  >
                    化学公式
                  </button>
                </div>
                <div className="p-4">
                  {expandedSection === 'math' && (
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {MATH_FORMULAS.map((formula) => (
                        <Button
                          key={formula.name}
                          variant="outline"
                          size="sm"
                          onClick={() => handleFormulaClick(formula.latex, 'math')}
                          className="flex items-center justify-between p-3 text-left"
                        >
                          <span className="font-medium">{formula.name}</span>
                          <span className="text-primary">
                            <RenderedSymbol latex={formula.latex} />
                          </span>
                        </Button>
                      ))}
                    </div>
                  )}
                  {expandedSection === 'chemistry' && (
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {CHEMISTRY_FORMULAS.map((formula) => (
                        <Button
                          key={formula.name}
                          variant="outline"
                          size="sm"
                          onClick={() => handleFormulaClick(formula.latex, 'chemistry')}
                          className="flex items-center justify-between p-3 text-left"
                        >
                          <span className="font-medium">{formula.name}</span>
                          <span className="text-primary">
                            <RenderedSymbol latex={formula.latex} />
                          </span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4 dark:border-gray-800">
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!latex.trim()}>
            确认
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EquationModal;
