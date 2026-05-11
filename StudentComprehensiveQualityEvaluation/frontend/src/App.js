import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Spin } from 'antd';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import TeacherList from './pages/TeacherList';
import StudentList from './pages/StudentList';
import GradeList from './pages/GradeList';
import RewardList from './pages/RewardList';
import AbilityList from './pages/AbilityList';
import EvaluationList from './pages/EvaluationList';
import MessageList from './pages/MessageList';
import PermissionList from './pages/PermissionList';

function AppContent() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const ProtectedRoute = ({ children, roles }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    if (roles && user && !roles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="teachers" element={<TeacherList />} />
        <Route path="students" element={<StudentList />} />
        <Route path="grades" element={<GradeList />} />
        <Route path="rewards" element={<RewardList />} />
        <Route path="ability" element={<AbilityList />} />
        <Route path="evaluations" element={<EvaluationList />} />
        <Route path="messages" element={<MessageList />} />
        <Route
          path="permissions"
          element={
            <ProtectedRoute roles={['admin']}>
              <PermissionList />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
