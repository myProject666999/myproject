import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Pets from './pages/Pets'
import PetDetail from './pages/PetDetail'
import Shops from './pages/Shops'
import ShopDetail from './pages/ShopDetail'
import LostPets from './pages/LostPets'
import LostPetDetail from './pages/LostPetDetail'
import Forum from './pages/Forum'
import PostDetail from './pages/PostDetail'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Profile from './pages/Profile'
import MyOrders from './pages/MyOrders'
import MyAddresses from './pages/MyAddresses'
import MyFavorites from './pages/MyFavorites'
import MyPosts from './pages/MyPosts'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminCategories from './pages/admin/Categories'
import AdminProducts from './pages/admin/Products'
import AdminPets from './pages/admin/Pets'
import AdminShops from './pages/admin/Shops'
import AdminOrders from './pages/admin/Orders'

function App() {
  const { user } = useAuth()

  const ProtectedRoute = ({ children, requireAdmin = false }: { children: JSX.Element; requireAdmin?: boolean }) => {
    if (!user) {
      return <Navigate to="/login" replace />
    }
    if (requireAdmin && user.role !== 'admin') {
      return <Navigate to="/" replace />
    }
    return children
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/pets" element={<Pets />} />
        <Route path="/pets/:id" element={<PetDetail />} />
        <Route path="/shops" element={<Shops />} />
        <Route path="/shops/:id" element={<ShopDetail />} />
        <Route path="/lost-pets" element={<LostPets />} />
        <Route path="/lost-pets/:id" element={<LostPetDetail />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/:id" element={<PostDetail />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-addresses"
          element={
            <ProtectedRoute>
              <MyAddresses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-favorites"
          element={
            <ProtectedRoute>
              <MyFavorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-posts"
          element={
            <ProtectedRoute>
              <MyPosts />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requireAdmin>
            <AdminRoutes />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function AdminRoutes() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="pets" element={<AdminPets />} />
        <Route path="shops" element={<AdminShops />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  )
}

export default App
