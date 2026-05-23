import { create } from "zustand";
import type { User } from "@/lib/types";

interface UserState {
  user: User | null;
  setUser: (u: User) => void;
  clear: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
  clear: () => set({ user: null }),
}));
