"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Contestant } from "@/lib/types";
import SiteShell from "@/components/SiteShell";
import { Search, Sparkles } from "lucide-react";

export default function ContestantsPage() {
  const [list, setList] = useState<Contestant[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/contestants")
      .then((r) => r.json())
      .then((d) => d.data && setList(d.data));
  }, []);

  const filtered = list.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <SiteShell>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-black">选手阵容</h1>
          <p className="text-white/60 mt-1">点击卡片查看详情并为 TA 投票</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            className="input-neo pl-9"
            placeholder="搜索选手..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((c) => (
          <Link
            key={c.id}
            href={`/contestants/${c.id}`}
            className="card overflow-hidden group hover:-translate-y-1 transition"
            style={{ boxShadow: `0 0 0 1px ${c.color}55` }}
          >
            <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-black to-bg">
              {c.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              ) : (
                <div className="w-full h-full grid place-items-center">
                  <Sparkles />
                </div>
              )}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition"
                style={{ background: `radial-gradient(circle at 50% 100%, ${c.color}55, transparent 70%)` }}
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">{c.name}</h3>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: `${c.color}22`, color: c.color }}
                >
                  #{c.id.toString().padStart(2, "0")}
                </span>
              </div>
              <p className="text-sm text-white/60 mt-1 line-clamp-2">{c.description}</p>
              <div className="mt-3 text-xs text-white/50 flex items-center justify-between">
                <span>总票数</span>
                <span className="font-mono text-white">{c.total_votes.toLocaleString()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </SiteShell>
  );
}
