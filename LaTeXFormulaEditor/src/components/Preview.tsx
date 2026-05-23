"use client";

import katex from "katex";
import { useEffect, useRef } from "react";
import { useEditor } from "@/store/editor";

interface Props {
  error?: string | null;
}

export default function Preview({ error }: Props) {
  const { latex, displayMode } = useEditor();
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    try {
      katex.render(latex || "", hostRef.current, {
        displayMode,
        throwOnError: false,
        output: "htmlAndMathml",
        strict: false,
        trust: true,
      });
    } catch (e: any) {
      hostRef.current.textContent = String(e?.message || "");
    }
  }, [latex, displayMode]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-ink-200 bg-white text-ink-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          <span>实时预览 {displayMode ? "· 独立公式" : "· 行内"}</span>
        </div>
        <span className="text-ink-500">{latex.length} chars</span>
      </div>
      <div className="flex-1 bg-white p-8 flex items-start justify-center overflow-auto preview-area">
        <div
          ref={hostRef}
          className="katex-wrapper animate-fadein"
          style={{ fontSize: "1.3rem" }}
        />
      </div>
      {error && (
        <div className="border-t border-red-200 bg-red-50 text-red-700 text-xs px-4 py-2">
          {error}
        </div>
      )}
    </div>
  );
}
