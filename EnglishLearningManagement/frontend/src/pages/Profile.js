import { useState, useEffect } from 'react';
import { authAPI, wordAPI, bookAPI } from '../services/api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [wordProgress, setWordProgress] = useState(null);
  const [readingProgress, setReadingProgress] = useState([]);

  useEffect(() => {
    loadUserData();
    loadProgress();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
      setProfileData({ name: response.data.name, email: response.data.email });
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  const loadProgress = async () => {
    try {
      const [wordRes, readingRes] = await Promise.all([
        wordAPI.getProgress(),
        bookAPI.getProgress(),
      ]);
      setWordProgress(wordRes.data);
      setReadingProgress(readingRes.data);
    } catch (err) {
      console.error('Failed to load progress:', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await authAPI.updateProfile(profileData);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setMessage('个人信息更新成功！');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || '更新失败');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    try {
      await authAPI.updatePassword({
        old_password: passwordData.oldPassword,
        new_password: passwordData.newPassword,
      });
      setMessage('密码更新成功！');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || '更新失败');
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">👤 个人中心</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {user && (
        <div className="grid-2">
          <div className="profile-section">
            <h3>📋 个人信息</h3>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>ID</label>
                <input type="text" value={user.id} disabled />
              </div>
              <div className="form-group">
                <label>姓名</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>邮箱</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>角色</label>
                <input type="text" value={user.role === 'admin' ? '管理员' : '普通用户'} disabled />
              </div>
              <button type="submit" className="btn">保存修改</button>
            </form>
          </div>

          <div className="profile-section">
            <h3>🔐 修改密码</h3>
            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label>当前密码</label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>新密码</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>确认新密码</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn">修改密码</button>
            </form>
          </div>
        </div>
      )}

      <div className="profile-section" style={{ marginTop: '30px' }}>
        <h3>📊 学习进度</h3>
        
        <div className="grid-2">
          <div>
            <h4 style={{ marginBottom: '15px', color: '#333' }}>📖 单词学习</h4>
            {wordProgress ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                {Object.entries(wordProgress).map(([level, data]) => (
                  <div key={level} className="card">
                    <h5 style={{ marginBottom: '10px', textTransform: 'uppercase' }}>
                      {level === 'cet4' ? '四级词汇' : level === 'cet6' ? '六级词汇' : level}
                    </h5>
                    <p style={{ marginBottom: '10px' }}>
                      已学习: {data.learned} / {data.total}
                    </p>
                    <div className="progress-bar">
                      <div className="progress" style={{ width: `${data.percent || 0}%` }}></div>
                    </div>
                    <p style={{ marginTop: '5px', color: '#666', fontSize: '0.9rem' }}>
                      进度: {data.percent?.toFixed(1) || 0}%
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#666' }}>暂无数据</p>
            )}
          </div>

          <div>
            <h4 style={{ marginBottom: '15px', color: '#333' }}>📚 阅读进度</h4>
            {readingProgress && readingProgress.length > 0 ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                {readingProgress.map((item) => (
                  <div key={item.book_id} className="card">
                    <h5 style={{ marginBottom: '10px' }}>{item.title}</h5>
                    <p>进度: {item.current_page}%</p>
                    {item.is_completed && <span style={{ color: '#28a745' }}>✅ 已完成</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#666' }}>暂无阅读记录</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
