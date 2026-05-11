import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated, getUserRole } from './utils/auth'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Doctors from './pages/Doctors'
import Nurses from './pages/Nurses'
import Patients from './pages/Patients'
import MedicalRecords from './pages/MedicalRecords'
import Medicines from './pages/Medicines'
import ChangePassword from './pages/ChangePassword'

const PrivateRoute = ({ children, requiredRoles }) => {
  const location = useLocation()
  const authenticated = isAuthenticated()
  const userRole = getUserRole()

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRoles && !requiredRoles.includes(userRole)) {
    return <Navigate to="/" replace />
  }

  return children
}

const App = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 100)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return null

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/"
        element={
          <PrivateRoute requiredRoles={['admin', 'doctor', 'nurse']}>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        <Route
          path="users"
          element={
            <PrivateRoute requiredRoles={['admin']}>
              <Users />
            </PrivateRoute>
          }
        />
        
        <Route path="doctors" element={<Doctors />} />
        <Route path="nurses" element={<Nurses />} />
        <Route path="patients" element={<Patients />} />
        <Route path="medical-records" element={<MedicalRecords />} />
        <Route path="medicines" element={<Medicines />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
