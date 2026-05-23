import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import AppLayout from '@/components/Layout'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import Editor from '@/pages/Editor'
import VersionHistory from '@/pages/VersionHistory'
import ShareSettings from '@/pages/ShareSettings'
import RecycleBin from '@/pages/RecycleBin'
import { storage } from '@/utils/storage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = storage.getToken()
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="documents" element={<Dashboard />} />
            <Route path="editor/:id" element={<Editor />} />
            <Route path="documents/:id/versions" element={<VersionHistory />} />
            <Route path="documents/:id/share" element={<ShareSettings />} />
            <Route path="recycle-bin" element={<RecycleBin />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}
