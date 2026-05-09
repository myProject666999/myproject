import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { UserManagement } from './pages/admin/UserManagement'
import { DepartmentManagement } from './pages/admin/DepartmentManagement'
import { RegistrationLevelManagement } from './pages/admin/RegistrationLevelManagement'
import { SettlementCategoryManagement } from './pages/admin/SettlementCategoryManagement'
import { DiagnosisCatalogManagement } from './pages/admin/DiagnosisCatalogManagement'
import { ChargeItemManagement } from './pages/admin/ChargeItemManagement'
import { MedicineManagement } from './pages/admin/MedicineManagement'
import { DoctorScheduleManagement } from './pages/admin/DoctorScheduleManagement'
import { ExpenseSubjectManagement } from './pages/admin/ExpenseSubjectManagement'
import { AppLayout } from './components/Layout'
import { useAuthStore } from './store/useAuthStore'

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute>
                <AppLayout>
                  <UserManagement />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <PrivateRoute>
                <AppLayout>
                  <DepartmentManagement />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/registration-levels"
            element={
              <PrivateRoute>
                <AppLayout>
                  <RegistrationLevelManagement />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/settlement-categories"
            element={
              <PrivateRoute>
                <AppLayout>
                  <SettlementCategoryManagement />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/diagnosis-catalogs"
            element={
              <PrivateRoute>
                <AppLayout>
                  <DiagnosisCatalogManagement />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/charge-items"
            element={
              <PrivateRoute>
                <AppLayout>
                  <ChargeItemManagement />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/medicines"
            element={
              <PrivateRoute>
                <AppLayout>
                  <MedicineManagement />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/doctor-schedules"
            element={
              <PrivateRoute>
                <AppLayout>
                  <DoctorScheduleManagement />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/expense-subjects"
            element={
              <PrivateRoute>
                <AppLayout>
                  <ExpenseSubjectManagement />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <PrivateRoute>
                <AppLayout>
                  <div style={{ padding: 24 }}>
                    <h2>管理功能页面</h2>
                    <p>此功能正在开发中...</p>
                  </div>
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/*"
            element={
              <PrivateRoute>
                <AppLayout>
                  <div style={{ padding: 24 }}>
                    <h2>医生功能页面</h2>
                    <p>此功能正在开发中...</p>
                  </div>
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/technician/*"
            element={
              <PrivateRoute>
                <AppLayout>
                  <div style={{ padding: 24 }}>
                    <h2>医技医生功能页面</h2>
                    <p>此功能正在开发中...</p>
                  </div>
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/pharmacy/*"
            element={
              <PrivateRoute>
                <AppLayout>
                  <div style={{ padding: 24 }}>
                    <h2>药房功能页面</h2>
                    <p>此功能正在开发中...</p>
                  </div>
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/reception/*"
            element={
              <PrivateRoute>
                <AppLayout>
                  <div style={{ padding: 24 }}>
                    <h2>挂号收费功能页面</h2>
                    <p>此功能正在开发中...</p>
                  </div>
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/statistics"
            element={
              <PrivateRoute>
                <AppLayout>
                  <div style={{ padding: 24 }}>
                    <h2>工作量统计</h2>
                    <p>此功能正在开发中...</p>
                  </div>
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/daily-settlement"
            element={
              <PrivateRoute>
                <AppLayout>
                  <div style={{ padding: 24 }}>
                    <h2>日结管理</h2>
                    <p>此功能正在开发中...</p>
                  </div>
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
