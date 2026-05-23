"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Award, RefreshCw } from "lucide-react";
import SiteShell from "@/components/SiteShell";
import type { Contestant } from "@/lib/types";

export default function RankingPage() {
  const [list, setList] = useState<Contestant[]>([]);

  async function refresh() {
    const r = await fetch("/api/ranking");
    const d = await r.json();
    if (d.ok) setList(d.data);
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 8000);
    return () => clearInterval(t);
  }, []);

  const top3 = list.slice(0, 3);
  const rest = list.slice(3);

  const podiumOrder =
    top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHeights = ["h-32", "h-44", "h-24"];
  const podiumColors = ["from-slate-300 to-slate-500", "from-yellow-300 to-amber-500", "from-orange-400 to-orange-700"];
  const podiumIcons = [Medal, Trophy, Award];

  return (
    <SiteShell>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-black flex items-center gap-2">
            <Trophy className="text-neon-gold" /> 实时榜单
          </h1>
          <p className="text-white/60 mt-1">每 8 秒自动刷新</p>
        </div>
        <button onClick={refresh} className="btn-ghost text-sm">
          <RefreshCw size={14} /> 刷新
        </button>
      </div>

      {top3.length > 0 && (
        <div className="mt-10 grid grid-cols-3 gap-4 items-end max-w-3xl mx-auto">
          {podiumOrder.map((c, i) => {
            const Icon = podiumIcons[i];
            return (
              <div key={c.id} className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 mb-2 animate-floaty">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {c.avatar && (
                    <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="font-display text-lg font-bold">{c.name}</div>
                <div className="text-xs text-white/50 font-mono">
                  {c.total_votes.toLocaleString()}
                </div>
                <div
                  className={`mt-3 w-full ${podiumHeights[i]} rounded-t-xl bg-gradient-to-b ${podiumColors[i]} grid place-items-center`}
                >
                  <Icon className="text-bg w-8 h-8" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-10 card overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_auto_auto] px-5 py-3 text-xs uppercase tracking-wider text-white/50 border-b border-white/5 bg-white/5">
          <div>排名</div>
          <div>选手</div>
          <div className="text-right">票数</div>
          <div className="w-32 text-right">占比</div>
        </div>
        {list.map((c, idx) => {
          const rank = idx + 1;
          const total = list[0]?.total_votes || 1;
          const pct = Math.round((c.total_votes / total) * 100);
          return (
            <div
              key={c.id}
              className="grid grid-cols-[60px_1fr_auto_auto] items-center px-5 py-4 border-b border-white/5 last:border-b-0 hover:bg-white/5"
            >
              <div>
                <span
                  className="font-display text-lg font-bold"
                  style={{ color: rank <= 3 ? "#fbbf24" : "#94a3b8" }}
                >
                  #{rank}
                </span>
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-full overflow-hidden shrink-0"
                  style={{ boxShadow: `0 0 0 2px ${c.color}88` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {c.avatar && (
                    <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="truncate">
                  <div className="font-bold truncate">{c.name}</div>
                </div>
              </div>
              <div className="font-mono text-right">
                {c.total_votes.toLocaleString()}
              </div>
              <div className="w-32 flex items-center justify-end gap-2">
                <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-pink"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-white/50 w-8 text-right">{pct}%</span>
              </div>
            </div>
          );
        })}
        {rest.length === 0 && list.length === 0 && (
          <div className="px-5 py-10 text-center text-white/40">暂无数据</div>
        )}
      </div>
    </SiteShell>
  );
}
