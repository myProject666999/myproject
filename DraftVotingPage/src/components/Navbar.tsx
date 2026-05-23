"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown, Users, Vote, History, LogIn, LogOut, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/user";

const NAV = [
  { href: "/contestants", label: "选手", icon: Users },
  { href: "/vote", label: "投票", icon: Vote },
  { href: "/ranking", label: "榜单", icon: Crown },
  { href: "/history", label: "历史", icon: History },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, setUser, clear } = useUserStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user) setUser(d.user);
      })
      .catch(() => {});
  }, [setUser]);

  async function onLogout() {
    await fetch("/api/auth/me", { method: "POST" });
    clear();
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-bg/70 border-b border-white/5">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="text-neon-cyan" />
          <span className="font-display text-xl font-black tracking-wider bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
            STARLIGHT
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm flex items-center gap-2 hover:bg-white/10"
              >
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink" />
                <span>{user.nickname}</span>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-40 card p-2">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-2 text-sm"
                  >
                    <LogOut size={16} /> 退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn-gradient text-sm">
              <LogIn size={16} /> 登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
