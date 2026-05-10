import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom'
import { Tabbar, TabbarItem, Home, Search, ShoppingCart, UserO } from 'vant'
import HomePage from './pages/Home'
import TasksPage from './pages/Tasks'
import MyPage from './pages/My'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import TaskDetailPage from './pages/TaskDetail'
import TaskResultPage from './pages/TaskResult'
import MyAssignmentsPage from './pages/MyAssignments'
import MyResultsPage from './pages/MyResults'
import MyFavoritesPage from './pages/MyFavorites'
import AnnouncementsPage from './pages/Announcements'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('user_token')
    setIsAuthenticated(!!token)
  }, [])

  useEffect(() => {
    const path = location.pathname
    if (path === '/home' || path === '/') setActiveTab(0)
    else if (path === '/tasks') setActiveTab(1)
    else if (path === '/my') setActiveTab(3)
  }, [location.pathname])

  const showTabbar = ['/', '/home', '/tasks', '/my'].includes(location.pathname)

  const handleTabChange = (index: number) => {
    setActiveTab(index)
    if (index === 0) navigate('/home')
    else if (index === 1) navigate('/tasks')
    else if (index === 2) {
      window.location.href = 'https://uri.amap.com/'
    }
    else if (index === 3) {
      if (!isAuthenticated) {
        navigate('/login')
      } else {
        navigate('/my')
      }
    }
  }

  return (
    <div className="app-container">
      <div className="page-content">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/tasks/:id/result" element={<TaskResultPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          {isAuthenticated ? (
            <>
              <Route path="/my" element={<MyPage />} />
              <Route path="/my/assignments" element={<MyAssignmentsPage />} />
              <Route path="/my/results" element={<MyResultsPage />} />
              <Route path="/my/favorites" element={<MyFavoritesPage />} />
            </>
          ) : (
            <Route path="/my/*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </div>
      {showTabbar && (
        <Tabbar active={activeTab} onChange={handleTabChange} activeColor="#1989fa">
          <TabbarItem icon={<Home />}>首页</TabbarItem>
          <TabbarItem icon={<Search />}>任务</TabbarItem>
          <TabbarItem icon={<ShoppingCart />}>导航</TabbarItem>
          <TabbarItem icon={<UserO />}>我的</TabbarItem>
        </Tabbar>
      )}
    </div>
  )
}

export default App
