import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from './utils/auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Opportunities from './pages/Opportunities'
import Customers from './pages/Customers'
import Contacts from './pages/Contacts'
import DailyReport from './pages/DailyReport'
import TeamReports from './pages/TeamReports'
import Organization from './pages/Organization'
import Users from './pages/system/Users'
import Roles from './pages/system/Roles'
import Menus from './pages/system/Menus'
import Permissions from './pages/system/Permissions'

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <Layout>{children}</Layout>
}

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/opportunities"
        element={
          <ProtectedRoute>
            <Opportunities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <Customers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <Contacts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/daily-report"
        element={
          <ProtectedRoute>
            <DailyReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team-reports"
        element={
          <ProtectedRoute>
            <TeamReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organization"
        element={
          <ProtectedRoute>
            <Organization />
          </ProtectedRoute>
        }
      />
      <Route
        path="/system/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/system/roles"
        element={
          <ProtectedRoute>
            <Roles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/system/menus"
        element={
          <ProtectedRoute>
            <Menus />
          </ProtectedRoute>
        }
      />
      <Route
        path="/system/permissions"
        element={
          <ProtectedRoute>
            <Permissions />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
