"use client";

import { useCallback, useEffect, useState } from "react";
import FormulaCard from "@/components/FormulaCard";
import { Search, RefreshCw } from "lucide-react";

interface Favorite {
  id: number;
  latex: string;
  title?: string;
  created_at: string;
}

export default function FavoritesPage() {
  const [list, setList] = useState<Favorite[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/favorites");
      if (r.ok) setList((await r.json()) as Favorite[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function unfav(id: number) {
    const r = await fetch(`/api/favorites/${id}`, { method: "DELETE" });
    if (r.ok) setList((xs) => xs.filter((x) => x.id !== id));
  }

  const filtered = list.filter(
    (x) => !q || x.title?.includes(q) || x.latex.includes(q)
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-brand-700">收藏夹</h1>
          <p className="text-xs text-ink-700">
            在这里快速找到你保存的常用公式，一键插入编辑区。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
            <input
              className="rounded-lg border border-ink-200 pl-8 pr-3 py-2 text-sm bg-white w-64"
              placeholder="搜索收藏..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <button className="btn-ghost" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            刷新
          </button>
        </div>
      </div>

      {loading && <div className="text-sm text-ink-500">加载中…</div>}
      {!loading && filtered.length === 0 && (
        <div className="card text-center text-ink-500 text-sm py-10">
          暂无收藏，到编辑页保存你喜欢的公式吧。
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((f) => (
          <FormulaCard
            key={f.id}
            id={f.id}
            title={f.title || new Date(f.created_at).toLocaleString()}
            latex={f.latex}
            favorited
            onFavorite={() => unfav(f.id)}
          />
        ))}
      </div>
    </div>
  );
}
