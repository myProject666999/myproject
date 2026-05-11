import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useUserStore } from './store/useStore'

import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import NewsList from './pages/NewsList'
import NewsDetail from './pages/NewsDetail'
import Profile from './pages/Profile'

import AdminLogin from './pages/admin/Login'
import AdminLayout from './pages/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import UserManagement from './pages/admin/UserManagement'
import CategoryManagement from './pages/admin/CategoryManagement'
import ProductManagement from './pages/admin/ProductManagement'
import BannerManagement from './pages/admin/BannerManagement'
import NewsManagement from './pages/admin/NewsManagement'
import OrderManagement from './pages/admin/OrderManagement'

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { user, isAdmin } = useUserStore()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }
  
  return children
}

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useUserStore()
  
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }
  
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/news" element={<NewsList />} />
      <Route path="/news/:id" element={<NewsDetail />} />
      
      <Route path="/cart" element={
        <PrivateRoute>
          <Cart />
        </PrivateRoute>
      } />
      <Route path="/checkout" element={
        <PrivateRoute>
          <Checkout />
        </PrivateRoute>
      } />
      <Route path="/profile/*" element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      } />
      
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="banners" element={<BannerManagement />} />
        <Route path="news" element={<NewsManagement />} />
        <Route path="orders" element={<OrderManagement />} />
      </Route>
    </Routes>
  )
}

export default App
