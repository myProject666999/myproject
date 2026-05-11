import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAdmin: false,
      cartCount: 0,
      
      setUser: (user, token) => set({ 
        user, 
        token,
        isAdmin: user?.role === 'admin'
      }),
      
      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      })),
      
      setCartCount: (count) => set({ cartCount: count }),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        isAdmin: false,
        cartCount: 0 
      })
    }),
    {
      name: 'user-storage'
    }
  )
)
