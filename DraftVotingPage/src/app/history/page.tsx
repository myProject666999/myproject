"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { History, LogIn } from "lucide-react";
import SiteShell from "@/components/SiteShell";
import { useUserStore } from "@/store/user";
import type { VoteRecord } from "@/lib/types";

export default function HistoryPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [records, setRecords] = useState<VoteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setRecords(d.data);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user && !loading) {
    return (
      <SiteShell>
        <div className="card p-10 text-center">
          <LogIn className="mx-auto text-neon-cyan" />
          <h2 className="mt-4 font-display text-xl font-bold">请先登录</h2>
          <p className="text-white/60 mt-2">登录后可查看你的投票历史</p>
          <button onClick={() => router.push("/login")} className="btn-gradient mt-5">
            前往登录
          </button>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div>
        <h1 className="font-display text-3xl font-black flex items-center gap-2">
          <History /> 投票历史
        </h1>
        <p className="text-white/60 mt-1">记录你为每一位选手投出的星光</p>
      </div>

      <div className="mt-8 card p-2">
        {records.length === 0 ? (
          <div className="px-6 py-16 text-center text-white/40">还没有投票记录</div>
        ) : (
          <div className="relative pl-10">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-neon-purple via-neon-pink to-transparent" />
            {records.map((r) => (
              <div key={r.id} className="relative py-4 border-b border-white/5 last:border-b-0">
                <div
                  className="absolute -left-6 top-5 w-3 h-3 rounded-full"
                  style={{ background: r.contestant_color, boxShadow: `0 0 12px ${r.contestant_color}` }}
                />
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-bold">{r.contestant_name}</span>
                    <span className="ml-3 text-sm text-white/50">
                      +{r.count} 票
                    </span>
                  </div>
                  <span className="text-xs text-white/40 font-mono">
                    {new Date(r.created_at).toLocaleString("zh-CN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
