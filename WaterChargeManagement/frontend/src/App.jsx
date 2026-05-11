import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AdminLayout from './layouts/AdminLayout'
import UserLayout from './layouts/UserLayout'
import AdminManagement from './pages/admin/AdminManagement'
import UserManagement from './pages/admin/UserManagement'
import CommunityManagement from './pages/admin/CommunityManagement'
import SettlementTypeManagement from './pages/admin/SettlementTypeManagement'
import WaterPriceManagement from './pages/admin/WaterPriceManagement'
import WaterMeterManagement from './pages/admin/WaterMeterManagement'
import WaterBillManagement from './pages/admin/WaterBillManagement'
import UserBills from './pages/user/UserBills'
import ChangePassword from './pages/ChangePassword'

function App() {
  const [role, setRole] = useState(localStorage.getItem('role'))

  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem('role'))
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const ProtectedRoute = ({ children, requiredRole }) => {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('role')

    if (!token) {
      return <Navigate to="/login" />
    }

    if (requiredRole && userRole !== requiredRole) {
      return <Navigate to={userRole === 'admin' ? '/admin' : '/user'} />
    }

    return children
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="admins" />} />
        <Route path="admins" element={<AdminManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="communities" element={<CommunityManagement />} />
        <Route path="settlement-types" element={<SettlementTypeManagement />} />
        <Route path="water-prices" element={<WaterPriceManagement />} />
        <Route path="water-meters" element={<WaterMeterManagement />} />
        <Route path="water-bills" element={<WaterBillManagement />} />
        <Route path="change-password" element={<ChangePassword role="admin" />} />
      </Route>
      <Route
        path="/user"
        element={
          <ProtectedRoute requiredRole="user">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="bills" />} />
        <Route path="bills" element={<UserBills />} />
        <Route path="change-password" element={<ChangePassword role="user" />} />
      </Route>
      <Route
        path="/"
        element={
          <Navigate to={role === 'admin' ? '/admin' : role === 'user' ? '/user' : '/login'} />
        }
      />
    </Routes>
  )
}

export default App
