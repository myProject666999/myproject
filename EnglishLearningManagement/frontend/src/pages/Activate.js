import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Activate() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      activateAccount();
    }
  }, [token]);

  const activateAccount = async () => {
    try {
      const response = await authAPI.activate(token);
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || '激活失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>⏳ 账户激活中...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{error ? '❌ 激活失败' : '✅ 激活成功'}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        <div className="auth-link">
          <Link to="/login">返回登录</Link>
        </div>
      </div>
    </div>
  );
}
