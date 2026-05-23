"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import katex from "katex";
import { Copy, Star, StarOff, ArrowRight } from "lucide-react";
import { useEditor } from "@/store/editor";

interface Props {
  id?: number;
  title?: string;
  latex: string;
  favorited?: boolean;
  onFavorite?: () => void;
  onInsert?: (latex: string) => void;
}

export default function FormulaCard({
  id,
  title,
  latex,
  favorited,
  onFavorite,
  onInsert,
}: Props) {
  const ref = { current: null as HTMLDivElement | null };
  const [, setTick] = useState(0);
  const router = useRouter();
  const { insert } = useEditor();

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(latex || "", ref.current, {
          displayMode: true,
          throwOnError: false,
          output: "htmlAndMathml",
          strict: false,
          trust: true,
        });
      } catch (e) {
        ref.current.textContent = String(e);
      }
    }
    setTick((t) => t + 1);
  }, [latex]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(latex);
    } catch {
      /* ignore */
    }
  }

  function handleInsert() {
    insert(latex);
    onInsert?.(latex);
    router.push("/");
  }

  return (
    <div className="card formula-item flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between">
        <div className="text-xs text-ink-500">#{id ?? "·"}</div>
        {title && (
          <div className="text-xs font-medium text-brand-700 truncate max-w-[60%]">
            {title}
          </div>
        )}
      </div>
      <div className="min-h-[80px] flex items-center justify-center py-3">
        <div
          ref={(el) => {
            ref.current = el;
          }}
          style={{ fontSize: "1rem" }}
        />
      </div>
      <pre className="text-xs text-ink-700 font-mono bg-ink-50 rounded px-2 py-1.5 whitespace-pre-wrap break-all">
        {latex}
      </pre>
      <div className="flex items-center gap-1 mt-auto pt-1">
        <button
          className="btn-primary text-xs"
          onClick={handleInsert}
        >
          <ArrowRight className="h-3.5 w-3.5" /> 插入并编辑
        </button>
        <button className="btn-ghost text-xs" onClick={copy} title="复制 LaTeX 源码">
          <Copy className="h-3.5 w-3.5" /> 复制
        </button>
        {onFavorite && (
          <button
            className={`btn-ghost text-xs ${
              favorited ? "text-amber-500 border-amber-300" : ""
            }`}
            onClick={onFavorite}
          >
            {favorited ? (
              <StarOff className="h-3.5 w-3.5" />
            ) : (
              <Star className="h-3.5 w-3.5" />
            )}
            {favorited ? "取消" : "收藏"}
          </button>
        )}
      </div>
    </div>
  );
}
