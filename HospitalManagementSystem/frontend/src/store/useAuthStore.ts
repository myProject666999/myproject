import { create } from 'zustand'
import type { User, RoleType } from '../types'
import { ROLE_MAP } from '../types'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  role: RoleType | null
  setAuth: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => {
  const storedToken = localStorage.getItem('token')
  const storedUser = localStorage.getItem('user')
  let user: User | null = null

  if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
    try {
      user = JSON.parse(storedUser)
    } catch {
      user = null
    }
  }

  return {
    token: storedToken,
    user,
    isAuthenticated: !!storedToken,
    role: user ? (ROLE_MAP[user.role_id] as RoleType) : null,

    setAuth: (token, user) => {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({
        token,
        user,
        isAuthenticated: true,
        role: ROLE_MAP[user.role_id] as RoleType,
      })
    },

    logout: () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        role: null,
      })
    },

    setUser: (user) => {
      localStorage.setItem('user', JSON.stringify(user))
      set({
        user,
        role: ROLE_MAP[user.role_id] as RoleType,
      })
    },
  }
})
