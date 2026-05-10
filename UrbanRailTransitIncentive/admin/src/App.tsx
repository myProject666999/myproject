import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import ChangePassword from './pages/ChangePassword'
import UserList from './pages/users/UserList'
import PublisherList from './pages/publishers/PublisherList'
import TaskTypeList from './pages/task-types/TaskTypeList'
import TaskList from './pages/tasks/TaskList'
import TaskDetail from './pages/tasks/TaskDetail'
import TaskResultList from './pages/results/TaskResultList'
import TaskResultDetail from './pages/results/TaskResultDetail'
import BannerList from './pages/banners/BannerList'
import AnnouncementList from './pages/announcements/AnnouncementList'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {isAuthenticated ? (
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="users" element={<UserList />} />
          <Route path="publishers" element={<PublisherList />} />
          <Route path="task-types" element={<TaskTypeList />} />
          <Route path="tasks" element={<TaskList />} />
          <Route path="tasks/:id" element={<TaskDetail />} />
          <Route path="results" element={<TaskResultList />} />
          <Route path="results/:id" element={<TaskResultDetail />} />
          <Route path="banners" element={<BannerList />} />
          <Route path="announcements" element={<AnnouncementList />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  )
}

export default App
