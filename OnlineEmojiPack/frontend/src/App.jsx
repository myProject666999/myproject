import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import AppHeader from './components/AppHeader'
import HomePage from './pages/HomePage'
import MaterialDetailPage from './pages/MaterialDetailPage'
import UploadPage from './pages/UploadPage'
import CollectionPage from './pages/CollectionPage'
import CollectionDetailPage from './pages/CollectionDetailPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

const { Content } = Layout

function App() {
  return (
    <Layout className="app-container">
      <AppHeader />
      <Content>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/materials/:id" element={<MaterialDetailPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/collections" element={<CollectionPage />} />
          <Route path="/collections/:id" element={<CollectionDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Content>
    </Layout>
  )
}

export default App
