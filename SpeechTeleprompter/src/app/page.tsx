"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText, Plus, Upload, Trash2, Play, Pencil } from "lucide-react";
import Header from "@/components/Header";

type ScriptSummary = {
  id: number;
  title: string;
  updatedAt: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(
    2,
    "0"
  )}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function HomePage() {
  const [scripts, setScripts] = useState<ScriptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch("/api/scripts");
      if (!res.ok) throw new Error("加载失败");
      const json = await res.json();
      setScripts(json.data ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleImport(file: File) {
    const text = await file.text();
    const res = await fetch("/api/scripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: file.name.replace(/\.(txt|md)$/i, ""),
        content: text,
      }),
    });
    if (!res.ok) throw new Error("导入失败");
    const json = await res.json();
    window.location.href = `/editor/${json.data.id}`;
  }

  async function handleDelete(id: number) {
    if (!confirm("确认删除该稿件？")) return;
    await fetch(`/api/scripts/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="mb-10">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-slate-100">
            让每一次演讲，<span className="text-amber-500">从容不迫</span>
          </h1>
          <p className="mt-3 max-w-xl text-slate-400">
            上传你的稿件，调节字号与速度，开启沉浸式滚动与录制。
          </p>
        </section>

        <section className="mb-10 grid gap-4 md:grid-cols-2">
          <Link
            href="/editor/new"
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-amber-500/60 hover:bg-white/10"
          >
            <Plus
              size={28}
              className="mb-3 text-amber-500 transition group-hover:scale-110"
            />
            <div className="font-serif text-xl font-semibold">新建稿件</div>
            <div className="mt-1 text-sm text-slate-400">
              从空白开始创建你的演讲稿
            </div>
          </Link>
          <label className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-amber-500/60 hover:bg-white/10">
            <Upload
              size={28}
              className="mb-3 text-amber-500 transition group-hover:scale-110"
            />
            <div className="font-serif text-xl font-semibold">导入文件</div>
            <div className="mt-1 text-sm text-slate-400">
              支持 .txt 与 .md 格式
            </div>
            <input
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImport(f);
                e.target.value = "";
              }}
            />
          </label>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">我的稿件</h2>
            {loading && <span className="text-sm text-slate-500">加载中…</span>}
            {error && <span className="text-sm text-rose-400">{error}</span>}
          </div>

          {scripts.length === 0 && !loading ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-slate-500">
              <FileText size={32} className="mx-auto mb-3 opacity-60" />
              还没有稿件，点击上方「新建稿件」开始吧。
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {scripts.map((s) => (
                <div
                  key={s.id}
                  className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-0.5 hover:border-amber-500/50 hover:bg-white/[0.07]"
                >
                  <div className="mb-2 truncate font-serif text-lg font-semibold text-amber-500">
                    {s.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    更新于 {formatDate(s.updatedAt)}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Link
                      href={`/play/${s.id}`}
                      className="btn-primary !px-3 !py-1.5 !text-xs"
                    >
                      <Play size={14} /> 播放
                    </Link>
                    <Link
                      href={`/editor/${s.id}`}
                      className="btn-outline !px-3 !py-1.5 !text-xs"
                    >
                      <Pencil size={14} /> 编辑
                    </Link>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="ml-auto rounded-full p-1.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
