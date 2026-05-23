"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Vote } from "lucide-react";
import SiteShell from "@/components/SiteShell";
import { useUserStore } from "@/store/user";
import type { Contestant } from "@/lib/types";

export default function ContestantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user } = useUserStore();
  const [data, setData] = useState<Contestant | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/contestants/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setData(d.data);
      });
  }, [params.id]);

  async function quickVote(count: number) {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!data) return;
    setLoading(true);
    try {
      const r = await fetch("/api/vote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contestantId: data.id, count }),
      });
      const d = await r.json();
      if (!d.ok) {
        alert(d.reason);
        return;
      }
      setData({ ...data, total_votes: d.totalOfContestant });
    } finally {
      setLoading(false);
    }
  }

  if (!data) {
    return (
      <SiteShell>
        <div className="py-20 text-center text-white/60">加载中...</div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <Link href="/contestants" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm">
        <ArrowLeft size={16} /> 返回选手列表
      </Link>

      <div className="mt-6 grid md:grid-cols-[320px_1fr] gap-8">
        <div
          className="aspect-square rounded-3xl overflow-hidden border border-white/10"
          style={{ boxShadow: `0 0 40px ${data.color}55` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.avatar} alt={data.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl font-black">{data.name}</h1>
            <span
              className="px-3 py-1 rounded-full text-xs font-mono"
              style={{ background: `${data.color}22`, color: data.color }}
            >
              #{data.id.toString().padStart(2, "0")}
            </span>
          </div>
          <p className="mt-4 text-white/70 leading-relaxed">{data.description}</p>

          <div className="mt-8 card p-6">
            <div className="flex items-center justify-between">
              <span className="text-white/60">当前总票数</span>
              <span
                className="font-display text-3xl font-black"
                style={{ color: data.color }}
              >
                {data.total_votes.toLocaleString()}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[1, 5, 10, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => quickVote(n)}
                  disabled={loading}
                  className="btn-ghost text-sm"
                >
                  <Vote size={14} /> 投 {n} 票
                </button>
              ))}
            </div>
            <Link href="/vote" className="btn-gradient mt-5">
              <Heart /> 前往投票页
            </Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
