import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import MainLayout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import UserManagement from '../pages/system/UserManagement';
import RoleManagement from '../pages/system/RoleManagement';
import MenuManagement from '../pages/system/MenuManagement';
import InsuranceManagement from '../pages/medical/InsuranceManagement';
import MedicineManagement from '../pages/medical/MedicineManagement';
import HealthRecord from '../pages/medical/HealthRecord';
import Appointment from '../pages/Appointment';
import VisitRecord from '../pages/VisitRecord';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'system/users', element: <UserManagement /> },
      { path: 'system/roles', element: <RoleManagement /> },
      { path: 'system/menus', element: <MenuManagement /> },
      { path: 'medical/insurances', element: <InsuranceManagement /> },
      { path: 'medical/medicines', element: <MedicineManagement /> },
      { path: 'medical/health', element: <HealthRecord /> },
      { path: 'appointments', element: <Appointment /> },
      { path: 'visits', element: <VisitRecord /> }
    ]
  }
]);

export default router;
