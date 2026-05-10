import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const user = await login(username, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setMessage(err.response?.data?.error || '登录失败');
    }
  };

  return (
    <div className="form-container">
      <h2>用户登录</h2>
      {message && <div className="message error">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="请输入用户名"
          />
        </div>
        <div className="form-group">
          <label>密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="请输入密码"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          登录
        </button>
      </form>
      <div className="switch-link">
        还没有账号？<Link to="/register">立即注册</Link>
      </div>
      <div style={{ marginTop: '15px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
        管理员账号: admin / admin123
      </div>
    </div>
  );
};

export default Login;
