import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ siteName }) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/forms') {
      return location.pathname.startsWith('/forms');
    }
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">{siteName}</Link>
      <div className="navbar-nav">
        <Link
          to="/forms"
          className={`nav-link ${isActive('/forms') ? 'active' : ''}`}
        >
          表单管理
        </Link>
        <Link
          to="/settings"
          className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
        >
          系统设置
        </Link>
      </div>
    </nav>
  );
}
