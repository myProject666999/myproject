import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import ProjectList from './pages/ProjectList.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import CreateProject from './pages/CreateProject.jsx';
import SupportOrder from './pages/SupportOrder.jsx';
import Profile from './pages/Profile.jsx';

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/profile" replace />;
  return children;
}

export default function App() {
  const token = localStorage.getItem('token');

  return (
    <div>
      <nav className="nav">
        <Link to="/">项目列表</Link>
        <Link to="/create">发起众筹</Link>
        <Link to="/profile" style={{ marginLeft: 'auto' }}>
          {token ? '个人中心' : '登录 / 注册'}
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<ProjectList />} />
        <Route path="/create" element={<RequireAuth><CreateProject /></RequireAuth>} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/projects/:id/support/:tierId" element={<RequireAuth><SupportOrder /></RequireAuth>} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}
