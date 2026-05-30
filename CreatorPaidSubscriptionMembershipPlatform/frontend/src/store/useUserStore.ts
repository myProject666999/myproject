import { create } from 'zustand';
import type { User, Creator } from '@/types';

interface UserState {
  user: User | null;
  currentCreator: Creator | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  setCurrentCreator: (creator: Creator | null) => void;
  login: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  currentCreator: null,
  isLoggedIn: false,
  setUser: (user) => set({ user }),
  setCurrentCreator: (currentCreator) => set({ currentCreator })),
  login: (user) => set({ user, isLoggedIn: true }),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, currentCreator: null, isLoggedIn: false });
  },
}));
