import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/auth';
import * as goalsApi from '../api/goals';
import type { User, UserGoal, LoginRequest, RegisterRequest, UpdateProfileRequest, UpdateGoalRequest } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  goal: UserGoal | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  register: (data: RegisterRequest) => Promise<void>;
  setUser: (user: User) => void;
  setGoal: (goal: UserGoal) => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  updateGoal: (data: UpdateGoalRequest) => Promise<void>;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      goal: null,
      isAuthenticated: false,

      login: async (credentials: LoginRequest) => {
        const response = await authApi.login(credentials);
        if (response.success && response.data) {
          set({
            token: response.data.token,
            user: response.data.user,
            goal: response.data.goal,
            isAuthenticated: true,
          });
        }
      },

      register: async (data: RegisterRequest) => {
        const response = await authApi.register(data);
        if (response.success && response.data) {
          set({
            token: response.data.token,
            user: response.data.user,
            goal: response.data.goal,
            isAuthenticated: true,
          });
        }
      },

      logout: () => {
        set({
          token: null,
          user: null,
          goal: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setGoal: (goal: UserGoal) => {
        set({ goal });
      },

      updateProfile: async (data: UpdateProfileRequest) => {
        const response = await authApi.updateProfile(data);
        if (response.success && response.data) {
          set({ user: response.data });
        }
      },

      updateGoal: async (data: UpdateGoalRequest) => {
        const response = await goalsApi.updateGoal(data);
        if (response.success && response.data) {
          set({ goal: response.data });
        }
      },

      loadFromStorage: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const goalStr = localStorage.getItem('goal');
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            const goal = goalStr ? JSON.parse(goalStr) : null;
            set({
              token,
              user,
              goal,
              isAuthenticated: true,
            });
          } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('goal');
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        goal: state.goal,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
