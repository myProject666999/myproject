import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Inbound from './pages/Inbound'
import Outbound from './pages/Outbound'
import Location from './pages/Location'
import Stocktake from './pages/Stocktake'
import InventoryLog from './pages/InventoryLog'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          isLoggedIn ? (
            <Layout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inbound" element={<Inbound />} />
        <Route path="outbound" element={<Outbound />} />
        <Route path="location" element={<Location />} />
        <Route path="stocktake" element={<Stocktake />} />
        <Route path="inventory-log" element={<InventoryLog />} />
      </Route>
    </Routes>
  )
}

export default App
