import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null })
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user, token: state.token })
    }
  )
)

export const useAppStore = create((set) => ({
  currentTeam: null,
  setCurrentTeam: (team) => set({ currentTeam: team }),
  loading: false,
  setLoading: (loading) => set({ loading })
}))
