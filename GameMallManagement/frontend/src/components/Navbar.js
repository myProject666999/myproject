import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <h1>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          🎮 游戏商城
        </Link>
      </h1>
      <div className="navbar-links">
        <Link to="/">游戏商店</Link>
        <Link to="/news">游戏资讯</Link>
        {user ? (
          <>
            <Link to="/cart">购物车</Link>
            <Link to="/orders">我的订单</Link>
            {isAdmin() && <Link to="/admin">管理后台</Link>}
            <span style={{ color: 'white', marginLeft: '10px' }}>
              欢迎, {user.username}
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              退出
            </button>
          </>
        ) : (
          <>
            <Link to="/login">登录</Link>
            <Link to="/register">注册</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
