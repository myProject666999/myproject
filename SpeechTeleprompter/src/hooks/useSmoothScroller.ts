import { useEffect, useRef } from "react";
import type { RefObject } from "react";

type Options = {
  speed: number;
  playing: boolean;
  basePxPerSecond?: number;
};

export function useSmoothScroller(
  targetRef: RefObject<HTMLElement | null>,
  { speed, playing, basePxPerSecond = 60 }: Options
) {
  const offsetRef = useRef(0);
  const currentSpeedRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  const speedRef = useRef(speed);
  const playingRef = useRef(playing);
  speedRef.current = speed;
  playingRef.current = playing;

  const baseRef = useRef(basePxPerSecond);
  baseRef.current = basePxPerSecond;

  useEffect(() => {
    const tick = (ts: number) => {
      const el = targetRef.current;

      if (!el) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      const targetSpeed =
        (playingRef.current ? 1 : 0) * speedRef.current * baseRef.current;
      currentSpeedRef.current +=
        (targetSpeed - currentSpeedRef.current) * 0.25;

      offsetRef.current += currentSpeedRef.current * dt;

      const maxOffset = Math.max(0, el.scrollHeight);
      if (offsetRef.current > maxOffset) offsetRef.current = maxOffset;
      if (offsetRef.current < 0) offsetRef.current = 0;

      el.style.transform = `translateY(${-offsetRef.current}px)`;

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [targetRef]);

  const scrollBy = (delta: number) => {
    const el = targetRef.current;
    if (!el) return;
    const maxOffset = Math.max(0, el.scrollHeight);
    offsetRef.current = Math.min(
      maxOffset,
      Math.max(0, offsetRef.current + delta)
    );
    el.style.transform = `translateY(${-offsetRef.current}px)`;
  };

  const reset = () => {
    offsetRef.current = 0;
    const el = targetRef.current;
    if (el) el.style.transform = "translateY(0)";
  };

  const getProgress = () => {
    const el = targetRef.current;
    if (!el) return 0;
    const maxOffset = Math.max(1, el.scrollHeight);
    return offsetRef.current / maxOffset;
  };

  return { scrollBy, reset, getProgress, offsetRef };
}
