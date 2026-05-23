"use client";

import { useMemo, useState } from "react";
import FormulaCard from "@/components/FormulaCard";
import { TEMPLATES, CATEGORIES } from "@/lib/templates";

export default function TemplatesPage() {
  const [cat, setCat] = useState<string>("全部");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    return TEMPLATES.filter(
      (t) =>
        (cat === "全部" || t.category === cat) &&
        (!query || t.title.includes(query) || t.latex.includes(query))
    );
  }, [cat, query]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-brand-700">公式模板库</h1>
          <p className="text-xs text-ink-700">
            精选常用 LaTeX 模板，一键插入编辑区，提高写作效率。
          </p>
        </div>
        <input
          className="rounded-lg border border-ink-200 px-3 py-2 text-sm bg-white w-64"
          placeholder="搜索模板名称或 LaTeX"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {(["全部", ...CATEGORIES] as string[]).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              cat === c
                ? "bg-brand-600 text-white"
                : "bg-ink-100 text-ink-700 hover:bg-ink-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {list.map((t) => (
          <FormulaCard
            key={t.id}
            title={`${t.title} · ${t.category}`}
            latex={t.latex}
          />
        ))}
      </div>
    </div>
  );
}
