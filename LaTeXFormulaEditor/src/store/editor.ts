import { create } from "zustand";

interface EditorState {
  latex: string;
  displayMode: boolean;
  setLatex: (v: string) => void;
  setDisplayMode: (v: boolean) => void;
  insert: (snippet: string) => void;
  clear: () => void;
}

export const useEditor = create<EditorState>((set, get) => ({
  latex: "\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)",
  displayMode: true,
  setLatex: (v) => set({ latex: v }),
  setDisplayMode: (v) => set({ displayMode: v }),
  insert: (snippet) =>
    set((st) => ({
      latex: st.latex ? st.latex + " " + snippet : snippet,
    })),
  clear: () => set({ latex: "" }),
}));
