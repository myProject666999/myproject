import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { adminAPI, announcementAPI } from '../services/api';

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState('');
  const [editData, setEditData] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const path = location.pathname.split('/admin/')[1] || 'dashboard';
    setActiveTab(path);
    loadData(path);
  }, [location.pathname]);

  const loadData = async (tab) => {
    try {
      if (tab === 'dashboard') {
        const response = await adminAPI.getStats();
        setStats(response.data);
      } else if (tab === 'users') {
        const response = await adminAPI.getUsers();
        setUsers(response.data);
      } else if (tab === 'announcements') {
        const response = await announcementAPI.getAll();
        setAnnouncements(response.data);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const handleTabChange = (tab) => {
    navigate(`/admin/${tab}`);
  };

  const openEditModal = (type, data = null) => {
    setEditType(type);
    setEditData(data);
    setShowEditModal(true);
    setMessage('');
    setError('');
  };

  const closeModal = () => {
    setShowEditModal(false);
    setEditData(null);
  };

  const handleResetPassword = async (userId) => {
    if (window.confirm('确定要重置该用户的密码为 123456 吗？')) {
      try {
        await adminAPI.resetUserPassword(userId);
        setMessage('密码重置成功！新密码: 123456');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setError(err.response?.data?.error || '重置失败');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('确定要删除该用户吗？')) {
      try {
        await adminAPI.deleteUser(userId);
        setMessage('用户删除成功');
        loadData('users');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setError(err.response?.data?.error || '删除失败');
      }
    }
  };

  const handleToggleUserRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (window.confirm(`确定要将该用户的角色从 ${user.role} 改为 ${newRole} 吗？`)) {
      try {
        await adminAPI.updateUser(user.id, { role: newRole });
        setMessage('角色更新成功');
        loadData('users');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setError(err.response?.data?.error || '更新失败');
      }
    }
  };

  const handleToggleUserActive = async (user) => {
    const newStatus = !user.is_active;
    try {
      await adminAPI.updateUser(user.id, { is_active: newStatus });
      loadData('users');
    } catch (err) {
      setError(err.response?.data?.error || '更新失败');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('确定要删除该公告吗？')) {
      try {
        await adminAPI.deleteAnnouncement(id);
        setMessage('公告删除成功');
        loadData('announcements');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setError(err.response?.data?.error || '删除失败');
      }
    }
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    try {
      if (editData?.id) {
        await adminAPI.updateAnnouncement(editData.id, editData);
      } else {
        await adminAPI.createAnnouncement(editData);
      }
      setMessage('保存成功');
      closeModal();
      loadData('announcements');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || '保存失败');
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">⚙️ 后台管理</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleTabChange('dashboard')}
        >
          📊 数据统计
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabChange('users')}
        >
          👥 用户管理
        </button>
        <button 
          className={`tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => handleTabChange('announcements')}
        >
          📢 公告管理
        </button>
      </div>

      {activeTab === 'dashboard' && stats && (
        <div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="number">{stats.total_users}</div>
              <div className="label">总用户数</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' }}>
              <div className="number">{stats.active_users}</div>
              <div className="label">活跃用户</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)' }}>
              <div className="number">{stats.total_words}</div>
              <div className="label">单词总数</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)' }}>
              <div className="number">{stats.total_books}</div>
              <div className="label">书籍总数</div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h4>📊 系统概览</h4>
              <p style={{ marginTop: '10px' }}>公告数量: {stats.total_announcements}</p>
              <p>活跃用户比例: {stats.total_users > 0 ? ((stats.active_users / stats.total_users) * 100).toFixed(1) : 0}%</p>
            </div>
            <div className="card">
              <h4>💡 快捷操作</h4>
              <div style={{ marginTop: '15px', display: 'grid', gap: '10px' }}>
                <button className="btn" style={{ width: '100%' }} onClick={() => handleTabChange('users')}>管理用户</button>
                <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => handleTabChange('announcements')}>发布公告</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>姓名</th>
                <th>邮箱</th>
                <th>角色</th>
                <th>状态</th>
                <th>注册时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{ 
                      color: user.role === 'admin' ? '#dc3545' : '#667eea',
                      fontWeight: 'bold'
                    }}>
                      {user.role === 'admin' ? '管理员' : '用户'}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      color: user.is_active ? '#28a745' : '#dc3545'
                    }}>
                      {user.is_active ? '激活' : '未激活'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="action-btn edit"
                      onClick={() => handleToggleUserRole(user)}
                    >
                      切换角色
                    </button>
                    <button 
                      className="action-btn reset"
                      onClick={() => handleResetPassword(user.id)}
                    >
                      重置密码
                    </button>
                    <button 
                      className="action-btn"
                      style={{ background: user.is_active ? '#ffc107' : '#28a745', color: user.is_active ? '#333' : 'white' }}
                      onClick={() => handleToggleUserActive(user)}
                    >
                      {user.is_active ? '禁用' : '启用'}
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div>
          <button 
            className="btn" 
            style={{ width: 'auto', marginBottom: '20px' }}
            onClick={() => openEditModal('announcement', { title: '', content: '' })}
          >
            + 发布新公告
          </button>

          {announcements.length === 0 ? (
            <p style={{ color: '#666' }}>暂无公告</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>标题</th>
                  <th>内容预览</th>
                  <th>发布时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.title}</td>
                    <td>{item.content.substring(0, 50)}...</td>
                    <td>{new Date(item.created_at).toLocaleString()}</td>
                    <td>
                      <button 
                        className="action-btn edit"
                        onClick={() => openEditModal('announcement', item)}
                      >
                        编辑
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteAnnouncement(item.id)}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showEditModal && editType === 'announcement' && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editData?.id ? '编辑公告' : '发布公告'}</h3>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={handleSaveAnnouncement}>
              <div className="form-group">
                <label>标题</label>
                <input
                  type="text"
                  value={editData?.title || ''}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>内容</label>
                <textarea
                  rows={6}
                  value={editData?.content || ''}
                  onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>取消</button>
                <button type="submit" className="btn">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
