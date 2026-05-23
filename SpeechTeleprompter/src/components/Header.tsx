"use client";

import Link from "next/link";
import { Mic2 } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500 text-ink-950 shadow-glow">
            <Mic2 size={18} strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="font-serif text-lg font-bold tracking-wide">
              演讲提词器
            </div>
            <div className="text-[11px] text-slate-400">
              Speech Teleprompter
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/" className="btn-ghost">
            稿件列表
          </Link>
          <Link href="/editor/new" className="btn-primary">
            新建稿件
          </Link>
        </nav>
      </div>
    </header>
  );
}
