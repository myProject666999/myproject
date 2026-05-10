import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setMessage('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setMessage('密码长度至少为6位');
      return;
    }

    try {
      await register(username, password);
      setSuccess(true);
      setMessage('注册成功！正在跳转到登录页...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || '注册失败');
    }
  };

  return (
    <div className="form-container">
      <h2>用户注册</h2>
      {message && (
        <div className={`message ${success ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
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
            placeholder="请输入密码（至少6位）"
          />
        </div>
        <div className="form-group">
          <label>确认密码</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="请再次输入密码"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          注册
        </button>
      </form>
      <div className="switch-link">
        已有账号？<Link to="/login">立即登录</Link>
      </div>
    </div>
  );
};

export default Register;
