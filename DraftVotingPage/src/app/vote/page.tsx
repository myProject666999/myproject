"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, Send, AlertCircle, CheckCircle2, Vote } from "lucide-react";
import SiteShell from "@/components/SiteShell";
import { useUserStore } from "@/store/user";
import type { Contestant } from "@/lib/types";

interface Quota {
  total: number;
  used: number;
  remaining: number;
  claimed: boolean;
  daily: number;
}

export default function VotePage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [list, setList] = useState<Contestant[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [count, setCount] = useState(1);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const [listRes, quotaRes] = await Promise.all([
      fetch("/api/contestants").then((r) => r.json()),
      user ? fetch("/api/vote/free").then((r) => r.json()) : Promise.resolve(null),
    ]);
    if (listRes?.data) setList(listRes.data);
    if (quotaRes?.ok) setQuota(quotaRes);
  }

  useEffect(() => {
    refresh();
  }, [user]);

  async function claim() {
    if (!user) {
      router.push("/login");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/vote/free", { method: "POST" });
      const d = await r.json();
      if (!d.ok) {
        setMsg({ type: "err", text: d.reason });
        return;
      }
      setQuota({ total: d.amount, used: 0, remaining: d.amount, claimed: true, daily: d.amount });
      setMsg({ type: "ok", text: `已领取今日 ${d.amount} 张免费票` });
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (selectedId == null) {
      setMsg({ type: "err", text: "请先选择选手" });
      return;
    }
    if (count < 1) {
      setMsg({ type: "err", text: "票数不能小于 1" });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/vote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contestantId: selectedId, count }),
      });
      const d = await r.json();
      if (!d.ok) {
        setMsg({ type: "err", text: d.reason });
        return;
      }
      setMsg({ type: "ok", text: `投票成功！剩余免费票 ${d.remaining} 张` });
      if (quota) setQuota({ ...quota, remaining: d.remaining });
      refresh();
    } finally {
      setBusy(false);
    }
  }

  const selected = list.find((c) => c.id === selectedId);

  return (
    <SiteShell>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black">投票中心</h1>
          <p className="text-white/60 mt-1">为你支持的选手贡献星光</p>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink grid place-items-center">
            <Gift size={18} />
          </div>
          <div>
            <div className="text-xs text-white/50">今日免费票</div>
            <div className="font-display text-xl font-bold">
              {quota ? `${quota.remaining}/${quota.total}` : "— / —"}
            </div>
          </div>
          <button
            onClick={claim}
            disabled={busy || quota?.claimed}
            className="btn-gradient text-sm disabled:opacity-60"
          >
            {quota?.claimed ? "已领取" : "领取"}
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`mt-6 card p-4 flex items-center gap-3 ${
            msg.type === "ok" ? "text-emerald-300" : "text-red-300"
          }`}
        >
          {msg.type === "ok" ? <CheckCircle2 /> : <AlertCircle />}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="card p-5">
          <h2 className="font-display text-lg font-bold">选择选手</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {list.map((c) => {
              const active = selectedId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition text-left ${
                    active
                      ? "border-neon-purple/60 bg-white/5"
                      : "border-white/5 hover:border-white/20"
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-full bg-bg overflow-hidden shrink-0"
                    style={{ boxShadow: `0 0 0 2px ${c.color}88` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {c.avatar && (
                      <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold truncate">{c.name}</div>
                    <div className="text-xs text-white/50">
                      {c.total_votes.toLocaleString()} 票
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card p-6 h-fit sticky top-24">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Vote /> 确认投票
          </h2>
          <div className="mt-4 p-4 rounded-xl bg-black/30 border border-white/5">
            <div className="text-xs text-white/50">已选择</div>
            <div className="font-display text-xl font-bold mt-1">
              {selected ? selected.name : "未选择选手"}
            </div>
          </div>

          <label className="block mt-5 space-y-2">
            <span className="text-sm text-white/70">票数</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCount((c) => Math.max(1, c - 1))}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                className="input-neo text-center font-display text-2xl font-bold"
              />
              <button
                onClick={() => setCount((c) => Math.min(50, c + 1))}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
              >
                +
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              {[1, 5, 10, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className="flex-1 text-xs py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                >
                  {n}
                </button>
              ))}
            </div>
          </label>

          <div className="mt-5 text-xs text-white/50 space-y-1">
            <div>• 单 IP 30 秒内最多 30 票</div>
            <div>• 单手机号每分钟最多 50 票</div>
            <div>• 单手机号每日最多 500 票</div>
          </div>

          <button
            onClick={submit}
            disabled={busy || !selectedId}
            className="btn-gradient w-full mt-5"
          >
            {busy ? "处理中..." : "确认投票"}
          </button>
        </div>
      </div>
    </SiteShell>
  );
}
