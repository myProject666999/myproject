import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import CityManagePage from './pages/CityManagePage.jsx';
import DetailPage from './pages/DetailPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <nav className="nav-bar">
        <div className="nav-brand">
          <span className="logo">🌤️</span>
          <span className="brand-text">天气预报聚合</span>
        </div>
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span>首页</span>
          </NavLink>
          <NavLink to="/cities" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span>城市管理</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span>设置</span>
          </NavLink>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cities" element={<CityManagePage />} />
          <Route path="/city/:cityId" element={<DetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
