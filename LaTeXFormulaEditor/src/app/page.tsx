"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Download,
  Image as ImageIcon,
  Copy,
  Trash2,
  Star,
  Save,
  History,
} from "lucide-react";
import Editor from "@/components/Editor";
import Preview from "@/components/Preview";
import SymbolPanel from "@/components/SymbolPanel";
import { useEditor } from "@/store/editor";

export default function HomePage() {
  const { latex, displayMode, setDisplayMode, clear } = useEditor();
  const [busy, setBusy] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const router = useRouter();

  const commit = useCallback(async (v: string) => {
    if (!v) return;
    try {
      await fetch("/api/history", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ latex: v }),
      });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/favorites");
        if (r.ok) {
          const list = (await r.json()) as { id: number; latex: string }[];
          setSavedIds(list.map((x) => x.id));
        }
      } catch {
        /* ignore */
      }
    })();
  }, [favorited]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(latex);
    } catch {
      /* ignore */
    }
  }

  async function doFavorite() {
    if (favorited) return;
    setBusy(true);
    try {
      const r = await fetch("/api/favorites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ latex, title: "" }),
      });
      if (r.ok) setFavorited(true);
    } finally {
      setBusy(false);
    }
  }

  async function download(format: "png" | "svg") {
    setBusy(true);
    try {
      const res = await fetch(`/api/export/${format}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ latex, displayMode, bg: "transparent" }),
      });
      if (!res.ok) throw new Error("export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `formula.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-brand-700">公式编辑器</h1>
          <p className="text-xs text-ink-700">
            输入 LaTeX 代码，实时预览、导出 PNG / SVG、收藏与历史自动记录。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="chip cursor-pointer">
            <input
              type="checkbox"
              className="mr-1"
              checked={displayMode}
              onChange={(e) => setDisplayMode(e.target.checked)}
            />
            独立公式模式
          </label>
          <button
            className="btn-ghost"
            onClick={() => router.push("/templates")}
          >
            <ImageIcon className="h-4 w-4" /> 模板库
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-0 overflow-hidden h-[420px]">
          <Editor onCommit={commit} />
        </div>
        <div className="card p-0 overflow-hidden h-[420px]">
          <Preview />
        </div>
      </div>

      <div className="card flex flex-wrap items-center gap-2">
        <button className="btn-ghost" onClick={clear}>
          <Trash2 className="h-4 w-4" /> 清空
        </button>
        <button className="btn-ghost" onClick={copy}>
          <Copy className="h-4 w-4" /> 复制 LaTeX
        </button>
        <button className="btn-ghost" onClick={() => router.push("/history")}>
          <History className="h-4 w-4" /> 历史
        </button>
        <div className="mx-2 h-6 w-px bg-ink-200" />
        <button
          className={`btn-ghost ${favorited ? "text-amber-500 border-amber-300" : ""}`}
          onClick={doFavorite}
          disabled={busy}
        >
          <Star className="h-4 w-4" /> {favorited ? "已收藏" : "收藏"}
        </button>
        <button
          className="btn-primary"
          onClick={() => download("png")}
          disabled={busy || !latex}
        >
          <Download className="h-4 w-4" /> 导出 PNG
        </button>
        <button
          className="btn-accent"
          onClick={() => download("svg")}
          disabled={busy || !latex}
        >
          <Save className="h-4 w-4" /> 导出 SVG
        </button>
        <div className="ml-auto text-xs text-ink-500">
          已收藏公式：{savedIds.length}
        </div>
      </div>

      <SymbolPanel />
    </div>
  );
}
