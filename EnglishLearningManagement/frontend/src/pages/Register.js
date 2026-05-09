import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      setSuccess(response.data.message + ' ' + (response.data.info || ''));
      
      if (response.data.info) {
        const tokenMatch = response.data.info.match(/token=([a-f0-9]+)/);
        if (tokenMatch) {
          setTimeout(() => {
            navigate(`/activate?token=${tokenMatch[1]}`);
          }, 2000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>📝 注册</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>姓名</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="请输入姓名"
            />
          </div>
          <div className="form-group">
            <label>邮箱</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="请输入邮箱"
            />
          </div>
          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              placeholder="至少6位字符"
            />
          </div>
          <div className="form-group">
            <label>确认密码</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              placeholder="再次输入密码"
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        <div className="auth-link">
          已有账号？<Link to="/login">立即登录</Link>
        </div>
      </div>
    </div>
  );
}
