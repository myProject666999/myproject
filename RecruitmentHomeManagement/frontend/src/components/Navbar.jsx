import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: '首页' },
    { to: '/jobs', label: '职位招聘' },
    { to: '/seekers', label: '求职信息' },
    { to: '/companies', label: '知名企业' },
    { to: '/blogs', label: '职场博客' },
  ];

  const getUserMenu = () => {
    if (!user) {
      return (
        <div className="nav-user">
          <Link to="/login" className="nav-link">登录</Link>
          <Link to="/register" className="nav-link nav-link-primary">注册</Link>
        </div>
      );
    }

    if (user.role === 'admin') {
      return (
        <div className="nav-user">
          <Link to="/admin" className="nav-link">管理后台</Link>
          <span className="nav-username">{user.name}</span>
          <button onClick={handleLogout} className="nav-link nav-link-logout">退出</button>
        </div>
      );
    }

    if (user.role === 'user') {
      return (
        <div className="nav-user">
          <Link to="/seeker/profile" className="nav-link">我的求职</Link>
          <Link to="/seeker/my-seekers" className="nav-link">我的简历</Link>
          <span className="nav-username">{user.name}</span>
          <button onClick={handleLogout} className="nav-link nav-link-logout">退出</button>
        </div>
      );
    }

    if (user.role === 'company') {
      return (
        <div className="nav-user">
          <Link to="/company/profile" className="nav-link">企业中心</Link>
          <Link to="/company/my-jobs" className="nav-link">我的职位</Link>
          <span className="nav-username">{user.name}</span>
          <button onClick={handleLogout} className="nav-link nav-link-logout">退出</button>
        </div>
      );
    }

    return null;
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          招聘之家
        </Link>
        <div className="nav-links">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="nav-link">
              {link.label}
            </Link>
          ))}
        </div>
        {getUserMenu()}
      </div>
    </nav>
  );
}

export default Navbar;
