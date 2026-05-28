import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import MainLayout from '../components/Layout/MainLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Meals from '../pages/Meals';
import Exercises from '../pages/Exercises';
import FoodLibrary from '../pages/FoodLibrary';
import Profile from '../pages/Profile';

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const PublicRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">页面不存在</p>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/',
            element: <Dashboard />,
          },
          {
            path: '/meals',
            element: <Meals />,
          },
          {
            path: '/exercises',
            element: <Exercises />,
          },
          {
            path: '/foods',
            element: <FoodLibrary />,
          },
          {
            path: '/profile',
            element: <Profile />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
