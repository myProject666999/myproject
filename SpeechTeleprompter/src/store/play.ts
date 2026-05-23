import { create } from "zustand";

type PlayState = {
  fontSize: number;
  speed: number;
  playing: boolean;
  mirrorX: boolean;
  mirrorY: boolean;
  setFontSize: (v: number) => void;
  setSpeed: (v: number) => void;
  setPlaying: (v: boolean) => void;
  togglePlaying: () => void;
  toggleMirrorX: () => void;
  toggleMirrorY: () => void;
};

export const usePlayStore = create<PlayState>((set) => ({
  fontSize: 32,
  speed: 1,
  playing: false,
  mirrorX: false,
  mirrorY: false,
  setFontSize: (v) => set({ fontSize: v }),
  setSpeed: (v) => set({ speed: v }),
  setPlaying: (v) => set({ playing: v }),
  togglePlaying: () => set((s) => ({ playing: !s.playing })),
  toggleMirrorX: () => set((s) => ({ mirrorX: !s.mirrorX })),
  toggleMirrorY: () => set((s) => ({ mirrorY: !s.mirrorY })),
}));
