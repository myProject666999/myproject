"use client";

import { useEditor } from "@/store/editor";
import { useEffect, useRef } from "react";

interface Props {
  placeholder?: string;
  onCommit?: (v: string) => void;
}

export default function Editor({ placeholder, onCommit }: Props) {
  const { latex, setLatex } = useEditor();
  const ref = useRef<HTMLTextAreaElement>(null);
  const commitTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (commitTimer.current) clearTimeout(commitTimer.current);
    if (onCommit) {
      commitTimer.current = setTimeout(() => onCommit(latex), 600);
    }
    return () => {
      if (commitTimer.current) clearTimeout(commitTimer.current);
    };
  }, [latex, onCommit]);

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-ink-200 bg-ink-900/95 text-ink-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-accent-500" />
          <span className="font-mono">latex.tex</span>
        </div>
        <span className="text-ink-300">LaTeX 输入区</span>
      </div>
      <textarea
        ref={ref}
        className="flex-1 w-full resize-none bg-ink-900 text-ink-50 font-mono text-sm p-4 focus:outline-none placeholder:text-ink-500 leading-relaxed"
        value={latex}
        onChange={(e) => setLatex(e.target.value)}
        placeholder={placeholder || "在此输入 LaTeX 公式，例如：\\frac{a}{b}"}
        spellCheck={false}
      />
    </div>
  );
}
