import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CourseDetail from './pages/CourseDetail'
import VideoPlayer from './pages/VideoPlayer'
import LearningCenter from './pages/LearningCenter'
import Quiz from './pages/Quiz'
import TeacherDashboard from './pages/TeacherDashboard'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/course/:id" element={<MainLayout><CourseDetail /></MainLayout>} />
      <Route path="/learn/:id" element={<PrivateRoute><MainLayout><VideoPlayer /></MainLayout></PrivateRoute>} />
      <Route path="/learning" element={<PrivateRoute><MainLayout><LearningCenter /></MainLayout></PrivateRoute>} />
      <Route path="/quiz/:courseId/:lessonId" element={<PrivateRoute><MainLayout><Quiz /></MainLayout></PrivateRoute>} />
      <Route path="/teacher" element={<PrivateRoute><MainLayout><TeacherDashboard /></MainLayout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
