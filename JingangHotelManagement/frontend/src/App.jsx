import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import { useState } from 'react'

import UserLogin from './pages/user/Login'
import UserRegister from './pages/user/Register'
import UserLayout from './layouts/UserLayout'
import AdminLogin from './pages/admin/Login'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/user/Home'
import Profile from './pages/user/Profile'
import MemberCenter from './pages/user/MemberCenter'
import Booking from './pages/user/Booking'
import Orders from './pages/user/Orders'
import Reviews from './pages/user/Reviews'
import MyReviews from './pages/user/MyReviews'
import AdminHome from './pages/admin/Home'
import AdminManagement from './pages/admin/AdminManagement'
import UserManagement from './pages/admin/UserManagement'
import RoomManagement from './pages/admin/RoomManagement'
import OrderManagement from './pages/admin/OrderManagement'
import ReviewManagement from './pages/admin/ReviewManagement'
import Statistics from './pages/admin/Statistics'

const { Content } = Layout

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/user/login" />} />
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/user/register" element={<UserRegister />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/user/*" element={<UserLayout>
        <Routes>
          <Route path="home" element={<Home />} />
          <Route path="profile" element={<Profile />} />
          <Route path="member" element={<MemberCenter />} />
          <Route path="booking" element={<Booking />} />
          <Route path="orders" element={<Orders />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="my-reviews" element={<MyReviews />} />
        </Routes>
      </UserLayout>} />
      <Route path="/admin/*" element={<AdminLayout>
        <Routes>
          <Route path="home" element={<AdminHome />} />
          <Route path="admins" element={<AdminManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="rooms" element={<RoomManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="reviews" element={<ReviewManagement />} />
          <Route path="statistics" element={<Statistics />} />
        </Routes>
      </AdminLayout>} />
    </Routes>
  )
}

export default App
