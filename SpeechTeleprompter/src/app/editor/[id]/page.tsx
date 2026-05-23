"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, Type, Minus, Plus } from "lucide-react";
import Header from "@/components/Header";

type ScriptDetail = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === "new";

  const [title, setTitle] = useState("未命名稿件");
  const [content, setContent] = useState("");
  const [fontSize, setFontSize] = useState(20);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [fontWeight, setFontWeight] = useState<400 | 500 | 700>(500);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef<number | null>(isNew ? null : Number(params.id));

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const res = await fetch(`/api/scripts/${params.id}`);
      if (!res.ok) return;
      const json: { data: ScriptDetail } = await res.json();
      setTitle(json.data.title);
      setContent(json.data.content);
    })();
  }, [isNew, params.id]);

  async function persist(nextTitle: string, nextContent: string) {
    setSaving(true);
    try {
      if (isNew || idRef.current === null) {
        const res = await fetch("/api/scripts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: nextTitle, content: nextContent }),
        });
        const json = await res.json();
        idRef.current = json.data.id;
        router.replace(`/editor/${json.data.id}`, { scroll: false });
      } else {
        await fetch(`/api/scripts/${idRef.current}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: nextTitle, content: nextContent }),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  }

  function scheduleSave(nextTitle: string, nextContent: string) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persist(nextTitle, nextContent), 600);
  }

  function onTitleChange(v: string) {
    setTitle(v);
    scheduleSave(v, content);
  }
  function onContentChange(v: string) {
    setContent(v);
    scheduleSave(title, v);
  }

  async function handleSaveNow() {
    await persist(title, content);
  }

  async function handleImport(file: File) {
    const text = await file.text();
    onContentChange(text);
    if (title === "未命名稿件") {
      onTitleChange(file.name.replace(/\.(txt|md)$/i, ""));
    }
  }

  async function handlePlay() {
    await persist(title, content);
    if (idRef.current) router.push(`/play/${idRef.current}`);
  }

  const charCount = content.length;
  const estMinutes = Math.max(1, Math.round(charCount / 250));

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/" className="btn-ghost">
            <ArrowLeft size={16} /> 返回
          </Link>
          <div className="flex-1" />
          <span className="text-xs text-slate-500">
            {saving ? "保存中…" : saved ? "已保存" : "自动保存已启用"}
          </span>
          <button onClick={handleSaveNow} className="btn-primary">
            <Save size={16} /> 立即保存
          </button>
          <button onClick={handlePlay} className="btn-outline">
            进入播放
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <section className="glass rounded-2xl p-5">
            <input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="稿件标题"
              className="mb-4 w-full border-0 bg-transparent font-serif text-2xl font-bold text-slate-100 outline-none placeholder:text-slate-600"
            />
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="在此输入或粘贴你的演讲稿…"
              className="nice-scroll h-[56vh] w-full resize-none rounded-xl border border-white/10 bg-ink-900/40 p-5 text-slate-100 outline-none focus:border-amber-500"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight,
                fontWeight,
              }}
            />
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
              <span>字符数：{charCount}</span>
              <span>预估时长：约 {estMinutes} 分钟</span>
              <label className="ml-auto cursor-pointer text-amber-400 hover:text-amber-300">
                <span className="inline-flex items-center gap-1">
                  <Upload size={14} /> 导入 .txt/.md
                </span>
                <input
                  type="file"
                  accept=".txt,.md"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImport(f);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </section>

          <aside className="glass rounded-2xl p-5">
            <h3 className="mb-4 flex items-center gap-2 font-serif text-base font-semibold">
              <Type size={16} className="text-amber-500" /> 排版设置
            </h3>

            <div className="mb-5">
              <label className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>字号</span>
                <span className="font-mono text-amber-400">{fontSize}px</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFontSize((s) => Math.max(12, s - 2))}
                  className="grid h-7 w-7 place-items-center rounded-full border border-white/10 hover:border-amber-500"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="range"
                  min={12}
                  max={64}
                  step={2}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="range flex-1"
                />
                <button
                  onClick={() => setFontSize((s) => Math.min(64, s + 2))}
                  className="grid h-7 w-7 place-items-center rounded-full border border-white/10 hover:border-amber-500"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>行高</span>
                <span className="font-mono text-amber-400">
                  {lineHeight.toFixed(1)}
                </span>
              </label>
              <input
                type="range"
                min={1.2}
                max={2.6}
                step={0.1}
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="range"
              />
            </div>

            <div className="mb-5">
              <div className="mb-2 text-xs text-slate-400">字重</div>
              <div className="flex gap-2">
                {[400, 500, 700].map((w) => (
                  <button
                    key={w}
                    onClick={() => setFontWeight(w as 400 | 500 | 700)}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-xs transition ${
                      fontWeight === w
                        ? "border-amber-500 text-amber-400"
                        : "border-white/10 text-slate-400 hover:border-white/30"
                    }`}
                    style={{ fontWeight: w }}
                  >
                    {w === 400 ? "常规" : w === 500 ? "中等" : "加粗"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-ink-900/40 p-4">
              <div className="mb-2 text-xs text-slate-500">预览</div>
              <div
                className="nice-scroll max-h-32 overflow-auto text-slate-200"
                style={{ fontSize: `${fontSize}px`, lineHeight, fontWeight }}
              >
                {content || "你输入的内容将在这里预览…"}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
