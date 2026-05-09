import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import SeekersPage from './pages/SeekersPage';
import SeekerDetailPage from './pages/SeekerDetailPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import BlogsPage from './pages/BlogsPage';
import BlogDetailPage from './pages/BlogDetailPage';
import CreateBlogPage from './pages/CreateBlogPage';
import SeekerProfilePage from './pages/SeekerProfilePage';
import MySeekersPage from './pages/MySeekersPage';
import BrowsingHistoryPage from './pages/BrowsingHistoryPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import MyJobsPage from './pages/MyJobsPage';
import AdminPage from './pages/AdminPage';

import './styles/global.css';
import './styles/navbar.css';
import './styles/auth.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            
            <Route path="/seekers" element={<SeekersPage />} />
            <Route path="/seekers/:id" element={<SeekerDetailPage />} />
            
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/companies/:id" element={<CompanyDetailPage />} />
            
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/blogs/:id" element={<BlogDetailPage />} />
            <Route path="/blog/create" element={<CreateBlogPage />} />
            
            <Route path="/seeker/profile" element={<SeekerProfilePage />} />
            <Route path="/seeker/my-seekers" element={<MySeekersPage />} />
            <Route path="/seeker/history" element={<BrowsingHistoryPage />} />
            
            <Route path="/company/profile" element={<CompanyProfilePage />} />
            <Route path="/company/my-jobs" element={<MyJobsPage />} />
            
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
