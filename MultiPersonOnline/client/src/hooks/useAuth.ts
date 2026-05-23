import { useEffect, useCallback } from 'react'
import { useUserStore } from '@/store/userStore'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const { user, token, isAuthenticated, loading, login, logout, register, fetchProfile } = useUserStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (token && !user) {
      fetchProfile()
    }
  }, [token, user, fetchProfile])

  const handleLogin = useCallback(async (data: { username: string; password: string; remember?: boolean }) => {
    await login(data)
    navigate('/dashboard')
  }, [login, navigate])

  const handleRegister = useCallback(async (data: { username: string; email: string; password: string; nickname?: string }) => {
    await register(data)
    navigate('/login')
  }, [register, navigate])

  const handleLogout = useCallback(() => {
    logout()
    navigate('/login')
  }, [logout, navigate])

  return {
    user,
    token,
    isAuthenticated,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  }
}
