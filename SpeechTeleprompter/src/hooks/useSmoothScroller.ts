import { useEffect, useRef } from "react";

type Options = {
  target: HTMLElement | null;
  getSpeed: () => number;
  getPlaying: () => boolean;
  basePxPerSecond?: number;
};

/**
 * 通过 transform: translateY 驱动目标元素向上滚动。
 * 速度以「1x = basePxPerSecond 像素/秒」为基准，使用线性插值平滑过渡，
 * 避免变速时的顿挫跳变。
 */
export function useSmoothScroller({
  target,
  getSpeed,
  getPlaying,
  basePxPerSecond = 60,
}: Options) {
  const offsetRef = useRef(0);
  const currentSpeedRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  useEffect(() => {
    if (!target) return;

    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      const targetSpeed =
        (getPlaying() ? 1 : 0) * getSpeed() * basePxPerSecond;
      // 线性插值：每帧将当前速度向目标速度靠近 10%
      currentSpeedRef.current +=
        (targetSpeed - currentSpeedRef.current) * 0.1;

      offsetRef.current += currentSpeedRef.current * dt;

      const maxOffset = Math.max(
        0,
        target.scrollHeight - target.clientHeight
      );
      if (offsetRef.current > maxOffset) offsetRef.current = maxOffset;
      if (offsetRef.current < 0) offsetRef.current = 0;

      target.style.transform = `translateY(${-offsetRef.current}px)`;

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [target, getSpeed, getPlaying, basePxPerSecond]);

  const scrollBy = (delta: number) => {
    if (!target) return;
    const maxOffset = Math.max(
      0,
      target.scrollHeight - target.clientHeight
    );
    offsetRef.current = Math.min(
      maxOffset,
      Math.max(0, offsetRef.current + delta)
    );
    target.style.transform = `translateY(${-offsetRef.current}px)`;
  };

  const reset = () => {
    offsetRef.current = 0;
    if (target) target.style.transform = "translateY(0)";
  };

  const getProgress = () => {
    if (!target) return 0;
    const maxOffset = Math.max(
      1,
      target.scrollHeight - target.clientHeight
    );
    return offsetRef.current / maxOffset;
  };

  return { scrollBy, reset, getProgress, offsetRef };
}
