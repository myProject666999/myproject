import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/user/Home';
import Jobs from './pages/user/Jobs';
import Resume from './pages/user/Resume';
import ChangePassword from './pages/ChangePassword';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Admins from './pages/admin/Admins';
import Recruiters from './pages/admin/Recruiters';
import Users from './pages/admin/Users';
import JobTypes from './pages/admin/JobTypes';
import AdminJobs from './pages/admin/Jobs';
import Exercises from './pages/admin/Exercises';
import News from './pages/admin/News';
import Reviews from './pages/admin/Reviews';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Home />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/resume" element={<Resume />} />
      <Route path="/change-password" element={<ChangePassword />} />
      
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="admins" element={<Admins />} />
        <Route path="recruiters" element={<Recruiters />} />
        <Route path="users" element={<Users />} />
        <Route path="job-types" element={<JobTypes />} />
        <Route path="jobs" element={<AdminJobs />} />
        <Route path="exercises" element={<Exercises />} />
        <Route path="news" element={<News />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
