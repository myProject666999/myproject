import { useCallback, useRef, useState } from "react";

type RecorderState = "idle" | "countdown" | "recording";

export function useMediaRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [countdown, setCountdown] = useState<number>(0);
  const [elapsed, setElapsed] = useState<number>(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTsRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState("idle");
  }, []);

  const start = useCallback(async () => {
    if (state !== "idle") return;
    try {
      setState("countdown");
      setCountdown(3);
      for (let i = 3; i > 0; i--) {
        setCountdown(i);
        await new Promise((r) => setTimeout(r, 1000));
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: "video/webm",
        });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };
      recorderRef.current = mr;
      startTsRef.current = Date.now();
      mr.start();
      setState("recording");
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((Date.now() - startTsRef.current) / 1000);
      }, 200);
    } catch (err) {
      console.error(err);
      setState("idle");
      alert("无法访问摄像头或麦克风");
    }
  }, [state]);

  const download = useCallback(() => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `teleprompter-${Date.now()}.webm`;
    a.click();
  }, [videoUrl]);

  return {
    state,
    countdown,
    elapsed,
    videoUrl,
    start,
    stop,
    download,
    setVideoUrl,
  };
}
