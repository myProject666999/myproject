import React from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function Profile() {
  const [user, setUser] = React.useState(null);
  const [orders, setOrders] = React.useState([]);
  const [error, setError] = React.useState('');
  const [mode, setMode] = React.useState('none'); // 'none' | 'login' | 'register'
  const [loginForm, setLoginForm] = React.useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = React.useState({ username: '', password: '', nickname: '' });
  const [regError, setRegError] = React.useState('');
  const [loginError, setLoginError] = React.useState('');

  React.useEffect(() => {
    loadUserAndOrders();
  }, []);

  const loadUserAndOrders = async () => {
    try {
      const meRes = await api.get('/users/me');
      setUser(meRes.data);
      const ordersRes = await api.get('/support/my');
      setOrders(ordersRes.data || []);
      setError('');
    } catch {
      setError('请先登录');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await api.post('/auth/login', loginForm);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userInfo', JSON.stringify(res.data.user));
      setLoginForm({ username: '', password: '' });
      setMode('none');
      await loadUserAndOrders();
    } catch (err) {
      setLoginError(err.response?.data?.message || '登录失败');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    if (registerForm.password.length < 6) {
      setRegError('密码至少需要 6 位');
      return;
    }
    try {
      const res = await api.post('/auth/register', registerForm);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userInfo', JSON.stringify(res.data.user));
      setRegisterForm({ username: '', password: '', nickname: '' });
      setMode('none');
      await loadUserAndOrders();
    } catch (err) {
      setRegError(err.response?.data?.message || '注册失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setUser(null);
    setOrders([]);
    setError('请先登录');
    setMode('none');
  };

  if (error && !user) {
    return (
      <div className="page">
        <h2>个人中心</h2>
        <p style={{ color: '#666' }}>{error}</p>

        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button onClick={() => { setMode('login'); setLoginError(''); }}>登录</button>
          <button onClick={() => { setMode('register'); setRegError(''); }}>注册新账号</button>
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLogin} style={{ marginTop: 16, maxWidth: 320 }}>
            <h3 style={{ marginTop: 0 }}>用户登录</h3>
            {loginError && <p style={{ color: '#ef4444', margin: '8px 0' }}>{loginError}</p>}
            <label>
              用户名
              <input
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                required
              />
            </label>
            <label>
              密码
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit">登录</button>
              <button type="button" onClick={() => setMode('none')}>取消</button>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} style={{ marginTop: 16, maxWidth: 320 }}>
            <h3 style={{ marginTop: 0 }}>用户注册</h3>
            {regError && <p style={{ color: '#ef4444', margin: '8px 0' }}>{regError}</p>}
            <label>
              用户名
              <input
                value={registerForm.username}
                onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                required
                minLength={3}
              />
            </label>
            <label>
              昵称
              <input
                value={registerForm.nickname}
                onChange={(e) => setRegisterForm({ ...registerForm, nickname: e.target.value })}
              />
            </label>
            <label>
              密码（至少 6 位）
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                required
                minLength={6}
              />
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit">注册</button>
              <button type="button" onClick={() => setMode('none')}>取消</button>
            </div>
          </form>
        )}

        <div style={{ marginTop: 24 }}>
          <Link to="/">返回首页</Link>
        </div>
      </div>
    );
  }

  if (!user) return <div className="page">加载中...</div>;

  const statusText = (s) => {
    const map = { 1: '已支付', 2: '已退款', 3: '已取消' };
    return map[s] || '未知';
  };

  return (
    <div className="page">
      <h2>个人中心</h2>
      <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <p style={{ fontSize: 18, fontWeight: 600 }}>{user.nickname}</p>
        <p style={{ color: '#666' }}>用户名: {user.username}</p>
        {user.email && <p style={{ color: '#666' }}>邮箱: {user.email}</p>}
        {user.phone && <p style={{ color: '#666' }}>手机: {user.phone}</p>}
        <button onClick={handleLogout} style={{ marginTop: 8 }}>退出登录</button>
      </div>

      <h3>我的支持订单 ({orders.length})</h3>
      {orders.length === 0 ? (
        <p style={{ color: '#999' }}>暂无订单，去 <Link to="/" style={{ color: '#2563eb' }}>发现项目</Link> 支持一下吧！</p>
      ) : (
        <ul>
          {orders.map((o) => (
            <li key={o.id} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>单号: {o.orderNo}</strong>
                <span style={{ color: '#22c55e' }}>{statusText(o.status)}</span>
              </div>
              <p>
                项目ID: {o.projectId} · 档位ID: {o.tierId} · 数量: {o.quantity} · 金额: ¥{o.amount.toLocaleString()}
              </p>
              <small style={{ color: '#999' }}>{new Date(o.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
