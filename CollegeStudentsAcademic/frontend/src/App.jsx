import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AdminLayout from './layouts/AdminLayout'
import StudentLayout from './layouts/StudentLayout'
import AdminLogin from './pages/admin/Login'
import StudentLogin from './pages/student/Login'
import StudentRegister from './pages/student/Register'

import Dashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/AdminUsers'
import StudentManagement from './pages/admin/StudentManagement'
import ServiceManagement from './pages/admin/ServiceManagement'
import AppointmentManagement from './pages/admin/AppointmentManagement'
import KnowledgeManagement from './pages/admin/KnowledgeManagement'
import MessageManagement from './pages/admin/MessageManagement'

import Home from './pages/student/Home'
import Services from './pages/student/Services'
import ServiceDetail from './pages/student/ServiceDetail'
import Knowledge from './pages/student/Knowledge'
import KnowledgeDetail from './pages/student/KnowledgeDetail'
import Profile from './pages/student/Profile'
import MyAppointments from './pages/student/MyAppointments'
import MyMessages from './pages/student/MyMessages'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token')
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (!token || savedUser.role !== 'admin') {
      return <Navigate to="/admin/login" replace />
    }
    return children
  }

  const StudentRoute = ({ children }) => {
    const token = localStorage.getItem('token')
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (!token || savedUser.role !== 'student') {
      return <Navigate to="/login" replace />
    }
    return children
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      
      <Route path="/login" element={<StudentLogin />} />
      <Route path="/register" element={<StudentRegister />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      
      <Route path="/" element={<StudentLayout />}>
        <Route path="home" element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="services/:id" element={<ServiceDetail />} />
        <Route path="knowledge" element={<Knowledge />} />
        <Route path="knowledge/:id" element={<KnowledgeDetail />} />
        <Route path="profile" element={<StudentRoute><Profile /></StudentRoute>} />
        <Route path="appointments" element={<StudentRoute><MyAppointments /></StudentRoute>} />
        <Route path="messages" element={<StudentRoute><MyMessages /></StudentRoute>} />
      </Route>
      
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="services" element={<ServiceManagement />} />
        <Route path="appointments" element={<AppointmentManagement />} />
        <Route path="knowledge" element={<KnowledgeManagement />} />
        <Route path="messages" element={<MessageManagement />} />
      </Route>
    </Routes>
  )
}

export default App
