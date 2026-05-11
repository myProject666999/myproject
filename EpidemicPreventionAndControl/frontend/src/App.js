import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Hospitals from './pages/admin/Hospitals';
import Manufacturers from './pages/admin/Manufacturers';
import Volunteers from './pages/admin/Volunteers';
import Activities from './pages/admin/Activities';
import Announcements from './pages/admin/Announcements';
import Finances from './pages/admin/Finances';
import PublicLayout from './pages/public/PublicLayout';
import PublicAnnouncements from './pages/public/PublicAnnouncements';
import PublicActivities from './pages/public/PublicActivities';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('token');
  const userInfo = localStorage.getItem('userInfo');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && userInfo) {
    const user = JSON.parse(userInfo);
    if (user.role !== requiredRole) {
      if (user.role === 'admin') {
        return <Navigate to="/admin" replace />;
      }
      return <Navigate to="/public" replace />;
    }
  }
  
  return children;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="hospitals" element={<Hospitals />} />
        <Route path="manufacturers" element={<Manufacturers />} />
        <Route path="volunteers" element={<Volunteers />} />
        <Route path="activities" element={<Activities />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="finances" element={<Finances />} />
      </Route>
      
      <Route 
        path="/public" 
        element={
          <ProtectedRoute requiredRole="volunteer">
            <PublicLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/public/announcements" replace />} />
        <Route path="announcements" element={<PublicAnnouncements />} />
        <Route path="activities" element={<PublicActivities />} />
      </Route>
      
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
