"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Lock } from "lucide-react";
import { useUserStore } from "@/store/user";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!/^\d{6,15}$/.test(phone)) {
      setErr("请输入正确的手机号");
      return;
    }
    if (code.length !== 6) {
      setErr("请输入 6 位验证码（开发环境任意 6 位即可）");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const d = await r.json();
      if (!d.ok) {
        setErr(d.reason ?? "登录失败");
        return;
      }
      setUser(d.user);
      router.push("/vote");
    } catch {
      setErr("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form
        onSubmit={onSubmit}
        className="card w-full max-w-md p-8 space-y-5 animate-glow"
      >
        <div>
          <h1 className="font-display text-3xl font-black bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
            登录 STARLIGHT
          </h1>
          <p className="text-white/60 text-sm mt-2">
            首次登录即注册，我们使用手机号识别身份。
          </p>
        </div>
        <label className="block space-y-2">
          <span className="text-sm text-white/70 flex items-center gap-2">
            <Phone size={14} /> 手机号
          </span>
          <input
            className="input-neo"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="请输入手机号"
            inputMode="numeric"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-white/70 flex items-center gap-2">
            <Lock size={14} /> 验证码
          </span>
          <div className="flex gap-2">
            <input
              className="input-neo"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6 位验证码"
              inputMode="numeric"
            />
            <button
              type="button"
              onClick={() => setCode("123456")}
              className="btn-ghost whitespace-nowrap text-sm"
            >
              填入 123456
            </button>
          </div>
          <p className="text-xs text-white/40">开发环境：任意 6 位数字均可登录</p>
        </label>
        {err && <div className="text-sm text-red-400">{err}</div>}
        <button type="submit" className="btn-gradient w-full" disabled={loading}>
          {loading ? "登录中..." : "登录 / 注册"}
        </button>
      </form>
    </div>
  );
}
