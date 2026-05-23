import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { ArrowRight, Sparkles, Crown, Vote } from "lucide-react";

export default function HomePage() {
  return (
    <SiteShell>
      <section className="relative overflow-hidden rounded-3xl border border-white/5 p-10 md:p-16 bg-gradient-to-br from-neon-purple/20 via-bg to-neon-pink/20">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-neon-pink/30 blur-3xl animate-floaty" />
        <div className="absolute -bottom-24 -left-16 w-96 h-96 rounded-full bg-neon-cyan/20 blur-3xl animate-floaty" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neon-cyan">
            <Sparkles size={14} /> 2026 STARLIGHT 选秀季
          </div>
          <h1 className="mt-6 font-display text-5xl md:text-7xl font-black tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan bg-clip-text text-transparent">
              为星光
            </span>
            <br />
            <span className="text-white">投出你的一票</span>
          </h1>
          <p className="mt-6 text-white/70 text-lg">
            每日 10 张免费票，支持你喜爱的选手登上领奖台。防刷票机制保护数据公平，每一票都真实有效。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/vote" className="btn-gradient">
              <Vote /> 立即投票
              <ArrowRight size={16} />
            </Link>
            <Link href="/ranking" className="btn-ghost">
              <Crown size={16} /> 查看榜单
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 grid md:grid-cols-3 gap-6">
        <FeatureCard
          title="选手介绍"
          desc="浏览所有参赛选手的详细资料，找到你的心头好。"
          href="/contestants"
        />
        <FeatureCard
          title="每日免费票"
          desc="每日自动重置，登录即可领取 10 张免费票。"
          href="/vote"
        />
        <FeatureCard
          title="实时榜单"
          desc="实时更新的票数排行榜，见证你偶像的登顶之路。"
          href="/ranking"
        />
      </section>
    </SiteShell>
  );
}

function FeatureCard({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="card p-6 hover:border-neon-purple/40 transition group">
      <h3 className="font-display text-xl font-bold text-white group-hover:text-neon-cyan transition">
        {title}
      </h3>
      <p className="mt-2 text-white/60 text-sm">{desc}</p>
      <div className="mt-4 text-xs text-neon-cyan opacity-0 group-hover:opacity-100 transition">
        进入 →
      </div>
    </Link>
  );
}
