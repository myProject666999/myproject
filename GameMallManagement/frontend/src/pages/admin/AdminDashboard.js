import React, { useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminGames from './AdminGames';
import AdminCategories from './AdminCategories';
import AdminUsers from './AdminUsers';
import AdminOrders from './AdminOrders';
import AdminNews from './AdminNews';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate('/login');
    }
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin()) {
    return null;
  }

  const isActive = (path) => {
    return location.pathname === `/admin${path === '/' ? '' : path}`;
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <Link
          to="/admin"
          className={isActive('/') ? 'active' : ''}
        >
          📊 概览
        </Link>
        <Link
          to="/admin/games"
          className={isActive('/games') ? 'active' : ''}
        >
          🎮 游戏管理
        </Link>
        <Link
          to="/admin/categories"
          className={isActive('/categories') ? 'active' : ''}
        >
          📁 分类管理
        </Link>
        <Link
          to="/admin/orders"
          className={isActive('/orders') ? 'active' : ''}
        >
          📦 订单管理
        </Link>
        <Link
          to="/admin/users"
          className={isActive('/users') ? 'active' : ''}
        >
          👥 用户管理
        </Link>
        <Link
          to="/admin/news"
          className={isActive('/news') ? 'active' : ''}
        >
          📰 资讯管理
        </Link>
      </div>
      <div className="admin-content">
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/games" element={<AdminGames />} />
          <Route path="/categories" element={<AdminCategories />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/news" element={<AdminNews />} />
        </Routes>
      </div>
    </div>
  );
};

const AdminOverview = () => {
  return (
    <div>
      <h2 className="page-title">管理后台概览</h2>
      <div className="welcome-banner">
        <h2>欢迎回来，管理员</h2>
        <p>游戏商城管理系统</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="number">6</div>
          <div className="label">游戏数量</div>
        </div>
        <div className="stat-card">
          <div className="number">5</div>
          <div className="label">游戏分类</div>
        </div>
        <div className="stat-card">
          <div className="number">1</div>
          <div className="label">注册用户</div>
        </div>
        <div className="stat-card">
          <div className="number">2</div>
          <div className="label">资讯文章</div>
        </div>
      </div>
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>功能模块</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>游戏管理</td>
              <td>游戏的增删改查、图片上传</td>
            </tr>
            <tr>
              <td>分类管理</td>
              <td>游戏类型的增删改查</td>
            </tr>
            <tr>
              <td>订单管理</td>
              <td>查看订单、发货、查看历史订单</td>
            </tr>
            <tr>
              <td>用户管理</td>
              <td>用户列表查询、用户信息删除</td>
            </tr>
            <tr>
              <td>资讯管理</td>
              <td>游戏资讯的增删改查</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
