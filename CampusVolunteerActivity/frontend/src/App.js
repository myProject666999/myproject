import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import VolunteerLayout from './components/VolunteerLayout';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Home from './pages/volunteer/Home';
import Activities from './pages/volunteer/Activities';
import ActivityDetail from './pages/volunteer/ActivityDetail';
import MyActivities from './pages/volunteer/MyActivities';
import Profile from './pages/volunteer/Profile';
import Points from './pages/volunteer/Points';
import Dashboard from './pages/admin/Dashboard';
import AdminActivities from './pages/admin/Activities';
import Volunteers from './pages/admin/Volunteers';
import ExcellentVolunteers from './pages/admin/ExcellentVolunteers';
import Carousels from './pages/admin/Carousels';
import Stats from './pages/admin/Stats';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center' }}>加载中...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

const VolunteerRoute = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="volunteer">
      <VolunteerLayout>{children}</VolunteerLayout>
    </ProtectedRoute>
  );
};

const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center' }}>加载中...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? (
          <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
        ) : (
          <Login />
        )}
      />

      <Route
        path="/"
        element={
          <VolunteerRoute>
            <Home />
          </VolunteerRoute>
        }
      />

      <Route
        path="/activities"
        element={
          <VolunteerRoute>
            <Activities />
          </VolunteerRoute>
        }
      />

      <Route
        path="/activities/:id"
        element={
          <VolunteerRoute>
            <ActivityDetail />
          </VolunteerRoute>
        }
      />

      <Route
        path="/my-activities"
        element={
          <VolunteerRoute>
            <MyActivities />
          </VolunteerRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <VolunteerRoute>
            <Profile />
          </VolunteerRoute>
        }
      />

      <Route
        path="/points"
        element={
          <VolunteerRoute>
            <Points />
          </VolunteerRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/activities"
        element={
          <AdminRoute>
            <AdminActivities />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/volunteers"
        element={
          <AdminRoute>
            <Volunteers />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/excellent-volunteers"
        element={
          <AdminRoute>
            <ExcellentVolunteers />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/carousels"
        element={
          <AdminRoute>
            <Carousels />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/stats"
        element={
          <AdminRoute>
            <Stats />
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
