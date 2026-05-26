import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';
import './index.css';

import SendPage from './pages/SendPage';
import DisplayPage from './pages/DisplayPage';
import AdminPage from './pages/AdminPage';
import LotteryPage from './pages/LotteryPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ConfigProvider locale={zhCN}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/send" replace />} />
        <Route path="/send" element={<SendPage />} />
        <Route path="/display" element={<DisplayPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/lottery" element={<LotteryPage />} />
      </Routes>
    </BrowserRouter>
  </ConfigProvider>
);
