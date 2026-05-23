import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { authApi } from './api'
import ActivityList from './pages/ActivityList'
import VotePage from './pages/VotePage'
import ResultPage from './pages/ResultPage'
import DashboardPage from './pages/DashboardPage'
import LotteryPage from './pages/LotteryPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  const [user, setUser] = useState(null)
  const location = useLocation()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const res = await authApi.me()
    if (res.code === 0 && res.data) {
      setUser(res.data)
      localStorage.setItem('user', JSON.stringify(res.data))
    } else {
      const cached = localStorage.getItem('user')
      if (cached) setUser(JSON.parse(cached))
    }
  }

  const handleLogout = async () => {
    await authApi.logout()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/login'
  }

  const isActive = (path) => location.pathname.startsWith(path)

  // No layout for login page
  if (location.pathname === '/login') {
    return <Routes><Route path="/login" element={<LoginPage />} /></Routes>
  }

  // No navbar for dashboard big screen
  if (location.pathname.startsWith('/dashboard')) {
    return <Routes><Route path="/dashboard/:id" element={<DashboardPage />} /></Routes>
  }

  return (
    <div>
      <nav className="navbar">
        <Link to="/" className="brand">🎉 投票 & 抽奖</Link>
        <div className="nav-links">
          <Link to="/" className={isActive('/') && !isActive('/admin') && !isActive('/dashboard') ? 'active' : ''}>活动列表</Link>
          {user?.role === 9 && (
            <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>后台配置</Link>
          )}
        </div>
        <div className="user-info">
          {user ? (
            <>
              <span>👤 {user.username}</span>
              <button className="btn-logout" onClick={handleLogout}>退出</button>
            </>
          ) : (
            <Link to="/login" className="btn-logout">登录</Link>
          )}
        </div>
      </nav>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<ActivityList />} />
          <Route path="/vote/:id" element={<VotePage />} />
          <Route path="/result/:id" element={<ResultPage />} />
          <Route path="/dashboard/:id" element={<DashboardPage />} />
          <Route path="/lottery/:id" element={<LotteryPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  )
}
