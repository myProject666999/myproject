import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AdminLayout from './components/AdminLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Scripts from './pages/Scripts'
import ScriptDetail from './pages/ScriptDetail'
import Discussions from './pages/Discussions'
import DiscussionDetail from './pages/DiscussionDetail'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import Profile from './pages/Profile'
import AdminUsers from './pages/admin/Users'
import AdminTypes from './pages/admin/Types'
import AdminScripts from './pages/admin/Scripts'
import AdminRooms from './pages/admin/Rooms'
import AdminOrders from './pages/admin/Orders'
import AdminDiscussions from './pages/admin/Discussions'
import AdminNews from './pages/admin/News'
import AdminCarousels from './pages/admin/Carousels'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/scripts" element={<Scripts />} />
        <Route path="/scripts/:id" element={<ScriptDetail />} />
        <Route path="/discussions" element={<Discussions />} />
        <Route path="/discussions/:id" element={<DiscussionDetail />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/users" replace />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="types" element={<AdminTypes />} />
          <Route path="scripts" element={<AdminScripts />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="discussions" element={<AdminDiscussions />} />
          <Route path="news" element={<AdminNews />} />
          <Route path="carousels" element={<AdminCarousels />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
