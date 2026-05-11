import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AdminLayout from './components/Layout'
import UserManagement from './pages/UserManagement'
import SchoolIntroManagement from './pages/SchoolIntroManagement'
import EnrollmentProjectManagement from './pages/EnrollmentProjectManagement'
import ExamPaperManagement from './pages/ExamPaperManagement'
import QuestionManagement from './pages/QuestionManagement'
import ForumManagement from './pages/ForumManagement'
import OrderManagement from './pages/OrderManagement'
import ExamManagement from './pages/ExamManagement'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken')
  return token ? children : <Navigate to="/login" />
}

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/users" />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route path="users" element={<UserManagement />} />
        <Route path="school-intros" element={<SchoolIntroManagement />} />
        <Route path="enrollment-projects" element={<EnrollmentProjectManagement />} />
        <Route path="exam-papers" element={<ExamPaperManagement />} />
        <Route path="questions" element={<QuestionManagement />} />
        <Route path="forum-posts" element={<ForumManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="exam-management" element={<ExamManagement />} />
      </Route>
    </Routes>
  )
}

export default App
