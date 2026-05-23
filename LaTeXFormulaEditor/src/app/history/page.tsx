"use client";

import { useCallback, useEffect, useState } from "react";
import FormulaCard from "@/components/FormulaCard";
import { Trash2, RefreshCw } from "lucide-react";

interface HistoryItem {
  id: number;
  latex: string;
  created_at: string;
}

export default function HistoryPage() {
  const [list, setList] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/history");
      if (r.ok) setList((await r.json()) as HistoryItem[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: number) {
    const r = await fetch(`/api/history/${id}`, { method: "DELETE" });
    if (r.ok) setList((xs) => xs.filter((x) => x.id !== id));
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-brand-700">历史记录</h1>
          <p className="text-xs text-ink-700">
            自动保存最近编辑的公式，快速回到之前的工作。
          </p>
        </div>
        <button className="btn-ghost" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          刷新
        </button>
      </div>

      {loading && <div className="text-sm text-ink-500">加载中…</div>}
      {!loading && list.length === 0 && (
        <div className="card text-center text-ink-500 text-sm py-10">
          暂无历史记录，去编辑页试试吧。
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {list.map((h) => (
          <div key={h.id} className="flex flex-col gap-1">
            <FormulaCard
              id={h.id}
              title={new Date(h.created_at).toLocaleString()}
              latex={h.latex}
            />
            <button
              className="self-end btn-ghost text-xs"
              onClick={() => remove(h.id)}
            >
              <Trash2 className="h-3.5 w-3.5" /> 删除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
