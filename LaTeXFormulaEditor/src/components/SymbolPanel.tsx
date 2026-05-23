"use client";

import { useState } from "react";
import { SYMBOLS } from "@/lib/templates";
import { useEditor } from "@/store/editor";

export default function SymbolPanel() {
  const { insert } = useEditor();
  const [active, setActive] = useState(SYMBOLS[0].category);

  const group = SYMBOLS.find((g) => g.category === active) ?? SYMBOLS[0];

  return (
    <div className="rounded-2xl border border-ink-200 bg-white">
      <div className="flex items-center gap-1 overflow-x-auto px-3 py-2 border-b border-ink-200">
        {SYMBOLS.map((s) => (
          <button
            key={s.category}
            onClick={() => setActive(s.category)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition ${
              active === s.category
                ? "bg-brand-600 text-white"
                : "bg-ink-100 text-ink-700 hover:bg-ink-200"
            }`}
          >
            {s.category}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 p-3">
        {group.items.map((it) => (
          <button
            key={it.label + it.latex}
            onClick={() => insert(it.latex)}
            title={it.latex}
            className="aspect-square flex items-center justify-center rounded-lg border border-ink-200 bg-white hover:bg-accent-500/10 hover:border-accent-400 transition text-xl"
          >
            <span
              dangerouslySetInnerHTML={{ __html: escapeToHtml(it.label) }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function escapeToHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
