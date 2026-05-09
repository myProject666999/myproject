import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Activate from './pages/Activate';
import Home from './pages/Home';
import Vocabulary from './pages/Vocabulary';
import Listening from './pages/Listening';
import Reading from './pages/Reading';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import './App.css';

function PrivateRoute({ children, requireAdmin = false }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname.startsWith('/activate');

  return (
    <div className="app-container">
      {!isAuthPage && user && (
        <nav className="navbar">
          <div className="nav-brand">
            <Link to="/" className="brand-link">📚 英语学习系统</Link>
          </div>
          <ul className="nav-menu">
            <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>首页</Link></li>
            <li><Link to="/vocabulary" className={location.pathname.startsWith('/vocabulary') ? 'active' : ''}>背单词</Link></li>
            <li><Link to="/listening" className={location.pathname.startsWith('/listening') ? 'active' : ''}>听力练习</Link></li>
            <li><Link to="/reading" className={location.pathname.startsWith('/reading') ? 'active' : ''}>阅读书籍</Link></li>
            <li><Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>个人中心</Link></li>
            {user.role === 'admin' && (
              <li><Link to="/admin" className={location.pathname.startsWith('/admin') ? 'active' : ''}>后台管理</Link></li>
            )}
          </ul>
          <div className="nav-user">
            <span className="user-greeting">你好, {user.name}</span>
            <button className="logout-btn" onClick={handleLogout}>退出</button>
          </div>
        </nav>
      )}

      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/activate" element={<Activate />} />
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/vocabulary" element={<PrivateRoute><Vocabulary /></PrivateRoute>} />
          <Route path="/listening" element={<PrivateRoute><Listening /></PrivateRoute>} />
          <Route path="/reading" element={<PrivateRoute><Reading /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/admin/*" element={<PrivateRoute requireAdmin={true}><Admin /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
