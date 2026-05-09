import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/user/Home';
import Books from './pages/user/Books';
import BookDetail from './pages/user/BookDetail';
import Knowledge from './pages/user/Knowledge';
import KnowledgeDetail from './pages/user/KnowledgeDetail';
import Courses from './pages/user/Courses';
import CourseDetail from './pages/user/CourseDetail';
import Messages from './pages/user/Messages';
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/AdminUsers';
import FrontUsers from './pages/admin/FrontUsers';
import NewsManage from './pages/admin/NewsManage';
import CampusStories from './pages/admin/CampusStories';
import Notices from './pages/admin/Notices';
import SystemSettings from './pages/admin/SystemSettings';
import MessageManage from './pages/admin/MessageManage';
import Carousels from './pages/admin/Carousels';
import BooksManage from './pages/admin/BooksManage';
import KnowledgeManage from './pages/admin/KnowledgeManage';
import CoursesManage from './pages/admin/CoursesManage';
import Categories from './pages/admin/Categories';
import Demands from './pages/admin/Demands';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="books" element={<Books />} />
          <Route path="books/:id" element={<BookDetail />} />
          <Route path="knowledge" element={<Knowledge />} />
          <Route path="knowledge/:id" element={<KnowledgeDetail />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="messages" element={<Messages />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admin-users" element={<AdminUsers />} />
          <Route path="front-users" element={<FrontUsers />} />
          <Route path="news" element={<NewsManage />} />
          <Route path="campus-stories" element={<CampusStories />} />
          <Route path="notices" element={<Notices />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="messages" element={<MessageManage />} />
          <Route path="carousels" element={<Carousels />} />
          <Route path="books" element={<BooksManage />} />
          <Route path="knowledge" element={<KnowledgeManage />} />
          <Route path="courses" element={<CoursesManage />} />
          <Route path="categories" element={<Categories />} />
          <Route path="demands" element={<Demands />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
