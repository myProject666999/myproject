import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import JielongCreate from './pages/JielongCreate.jsx';
import JielongDetail from './pages/JielongDetail.jsx';
import JielongList from './pages/JielongList.jsx';
import MyJielongs from './pages/MyJielongs.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">
            <span className="logo-icon">📋</span>
            <span>在线接龙</span>
          </Link>
          <nav className="nav">
            <Link to="/">首页</Link>
            <Link to="/create">创建接龙</Link>
            <Link to="/mine">我的接龙</Link>
          </nav>
        </div>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<JielongList />} />
          <Route path="/create" element={<JielongCreate />} />
          <Route path="/mine" element={<MyJielongs />} />
          <Route path="/jielong/:id" element={<JielongDetail />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>在线接龙 / 报名统计系统</p>
      </footer>
    </div>
  );
}
