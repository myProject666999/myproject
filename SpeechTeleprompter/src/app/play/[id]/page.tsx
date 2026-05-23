"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Play,
  Pause,
  SkipBack,
  Minus,
  Plus,
  FlipHorizontal,
  FlipVertical,
  Video,
  Square,
  Download,
  Maximize,
  Settings2,
  ArrowLeft,
} from "lucide-react";
import { usePlayStore } from "@/store/play";
import { useSmoothScroller } from "@/hooks/useSmoothScroller";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";

type ScriptDetail = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export default function PlayPage() {
  const params = useParams<{ id: string }>();
  const [script, setScript] = useState<ScriptDetail | null>(null);
  const [showPanel, setShowPanel] = useState(true);

  const fontSize = usePlayStore((s) => s.fontSize);
  const speed = usePlayStore((s) => s.speed);
  const playing = usePlayStore((s) => s.playing);
  const mirrorX = usePlayStore((s) => s.mirrorX);
  const mirrorY = usePlayStore((s) => s.mirrorY);
  const setFontSize = usePlayStore((s) => s.setFontSize);
  const setSpeed = usePlayStore((s) => s.setSpeed);
  const togglePlaying = usePlayStore((s) => s.togglePlaying);
  const toggleMirrorX = usePlayStore((s) => s.toggleMirrorX);
  const toggleMirrorY = usePlayStore((s) => s.toggleMirrorY);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const { scrollBy, reset, getProgress } = useSmoothScroller(scrollerRef, {
    speed,
    playing,
    basePxPerSecond: 80,
  });

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setProgress(getProgress());
    }, 200);
    return () => clearInterval(id);
  }, [getProgress]);

  const {
    state: recState,
    countdown,
    elapsed,
    videoUrl,
    start: recStart,
    stop: recStop,
    download: recDownload,
  } = useMediaRecorder();

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/scripts/${params.id}`);
      if (!res.ok) return;
      const json: { data: ScriptDetail } = await res.json();
      setScript(json.data);
    })();
  }, [params.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlaying();
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        scrollBy(-80);
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        scrollBy(80);
      } else if (e.key === "h" || e.key === "H") {
        toggleMirrorX();
      } else if (e.key === "v" || e.key === "V") {
        toggleMirrorY();
      } else if (e.key === "r" || e.key === "R") {
        reset();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlaying, toggleMirrorX, toggleMirrorY, scrollBy, reset]);

  function onWheel(e: React.WheelEvent) {
    if (!playing) scrollBy(e.deltaY);
  }

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }

  if (!script) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        加载中…
      </div>
    );
  }

  const speedPresets = [0.5, 1, 1.5, 2];

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-ink-950"
      onWheel={onWheel}
    >
      {/* 顶部极简导航 */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10"
        >
          <ArrowLeft size={14} /> 退出播放
        </Link>
        <div className="font-serif text-sm text-slate-400">
          {script.title}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>进度 {Math.round(progress * 100)}%</span>
          <button
            onClick={() => setShowPanel((v) => !v)}
            className="rounded-full bg-white/5 p-2 hover:bg-white/10"
            title="显示/隐藏控制条"
          >
            <Settings2 size={14} />
          </button>
        </div>
      </div>

      {/* 中央读线 */}
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 z-10 -translate-y-1/2">
        <div className="mx-auto h-px max-w-3xl bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
      </div>

      {/* 固定视口 + 滚动内容 */}
      <div className="fixed inset-0 overflow-hidden">
        <div
          style={{
            transform: `scaleX(${mirrorX ? -1 : 1}) scaleY(${mirrorY ? -1 : 1})`,
          }}
        >
          <div
            ref={scrollerRef}
            className="mx-auto max-w-3xl px-8 will-change-transform"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: 1.9,
              fontWeight: 500,
              color: "#e2e8f0",
              whiteSpace: "pre-wrap",
            }}
          >
            <div style={{ height: "50vh" }} />
            {script.content}
            <div style={{ height: "100vh" }} />
          </div>
        </div>
      </div>

      {/* 倒计时覆盖层 */}
      {recState === "countdown" && (
        <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center">
          <div className="font-serif text-[180px] font-bold text-amber-500 drop-shadow-glow animate-pulse">
            {countdown}
          </div>
        </div>
      )}

      {/* 录制状态条 */}
      {recState === "recording" && (
        <div className="absolute left-1/2 top-20 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-rose-500/20 px-4 py-1.5 text-sm text-rose-300 ring-1 ring-rose-500/40">
          <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />
          录制中 · {elapsed.toFixed(1)}s
        </div>
      )}

      {/* 底部控制条 */}
      <div
        className={`fixed bottom-6 left-1/2 z-30 -translate-x-1/2 transition ${
          showPanel ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <div className="glass flex items-center gap-1 rounded-full px-3 py-2 shadow-2xl">
          <button
            onClick={togglePlaying}
            className="grid h-10 w-10 place-items-center rounded-full bg-amber-500 text-ink-950 shadow-glow hover:bg-amber-400"
            title={playing ? "暂停 (Space)" : "播放 (Space)"}
          >
            {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>
          <button
            onClick={() => {
              reset();
              usePlayStore.getState().setPlaying(false);
            }}
            className="grid h-10 w-10 place-items-center rounded-full text-slate-300 hover:bg-white/10"
            title="重置 (R)"
          >
            <SkipBack size={18} />
          </button>

          <div className="mx-2 h-6 w-px bg-white/10" />

          {/* 速度预设 */}
          <div className="flex items-center gap-1">
            {speedPresets.map((p) => (
              <button
                key={p}
                onClick={() => setSpeed(p)}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  Math.abs(speed - p) < 0.01
                    ? "bg-amber-500 text-ink-950"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                {p}x
              </button>
            ))}
          </div>
          <input
            type="range"
            min={0.2}
            max={3}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="range ml-2 w-24"
            title={`速度 ${speed.toFixed(1)}x`}
          />

          <div className="mx-2 h-6 w-px bg-white/10" />

          {/* 字号 */}
          <button
            onClick={() => setFontSize(Math.max(16, fontSize - 4))}
            className="grid h-9 w-9 place-items-center rounded-full text-slate-300 hover:bg-white/10"
            title="字号减小"
          >
            <Minus size={16} />
          </button>
          <span className="w-12 text-center font-mono text-xs text-amber-400">
            {fontSize}px
          </span>
          <button
            onClick={() => setFontSize(Math.min(96, fontSize + 4))}
            className="grid h-9 w-9 place-items-center rounded-full text-slate-300 hover:bg-white/10"
            title="字号增大"
          >
            <Plus size={16} />
          </button>

          <div className="mx-2 h-6 w-px bg-white/10" />

          {/* 镜像 */}
          <button
            onClick={toggleMirrorX}
            className={`grid h-9 w-9 place-items-center rounded-full transition ${
              mirrorX
                ? "bg-amber-500/20 text-amber-400"
                : "text-slate-300 hover:bg-white/10"
            }`}
            title="水平镜像 (H)"
          >
            <FlipHorizontal size={16} />
          </button>
          <button
            onClick={toggleMirrorY}
            className={`grid h-9 w-9 place-items-center rounded-full transition ${
              mirrorY
                ? "bg-amber-500/20 text-amber-400"
                : "text-slate-300 hover:bg-white/10"
            }`}
            title="垂直镜像 (V)"
          >
            <FlipVertical size={16} />
          </button>

          <div className="mx-2 h-6 w-px bg-white/10" />

          {/* 录制 */}
          {recState === "idle" && !videoUrl && (
            <button
              onClick={recStart}
              className="grid h-9 w-9 place-items-center rounded-full text-rose-300 hover:bg-rose-500/10"
              title="开始录制"
            >
              <Video size={16} />
            </button>
          )}
          {recState !== "idle" && (
            <button
              onClick={recStop}
              className="grid h-9 w-9 place-items-center rounded-full text-rose-300 hover:bg-rose-500/10"
              title="停止录制"
            >
              <Square size={16} />
            </button>
          )}
          {videoUrl && recState === "idle" && (
            <button
              onClick={recDownload}
              className="grid h-9 w-9 place-items-center rounded-full text-amber-400 hover:bg-amber-500/10"
              title="下载录制文件"
            >
              <Download size={16} />
            </button>
          )}

          <div className="mx-2 h-6 w-px bg-white/10" />

          <button
            onClick={toggleFullscreen}
            className="grid h-9 w-9 place-items-center rounded-full text-slate-300 hover:bg-white/10"
            title="全屏"
          >
            <Maximize size={16} />
          </button>
        </div>

        <div className="mt-2 text-center text-[11px] text-slate-500">
          空格播放/暂停 · 方向键微调 · H/V 镜像 · R 重置
        </div>
      </div>
    </div>
  );
}
