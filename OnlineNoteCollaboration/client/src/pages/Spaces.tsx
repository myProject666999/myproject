import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { spacesApi } from '../api';

interface Space {
  id: number;
  name: string;
  description: string;
  is_default: number;
}

const Spaces: React.FC = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDesc, setNewSpaceDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    try {
      const response = await spacesApi.list();
      setSpaces(response.data);
    } catch (err) {
      console.error('加载空间失败', err);
    }
  };

  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) return;
    setLoading(true);
    try {
      await spacesApi.create({ name: newSpaceName, description: newSpaceDesc });
      setShowCreateModal(false);
      setNewSpaceName('');
      setNewSpaceDesc('');
      loadSpaces();
    } catch (err: any) {
      alert(err.response?.data?.message || '创建空间失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">在线笔记协作</div>
        <div className="sidebar-nav">
          <div style={{ padding: '10px 15px', fontSize: 12, color: '#999', textTransform: 'uppercase' }}>
          我的空间
        </div>
        {spaces.map((space) => (
          <a
          key={space.id}
          onClick={() => navigate(`/spaces/${space.id}`)}
          style={{ cursor: 'pointer' }}
        >
          📁 {space.name}
          {space.is_default && <span style={{ marginLeft: 8, fontSize: 12, color: '#1890ff' }}>默认</span>}
        </a>
        ))}
      </div>
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#1890ff', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', marginRight: 8
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <span>{user?.username}</span>
          </div>
          <button className="btn btn-default" onClick={handleLogout} style={{ padding: '4px 8px', fontSize: 12 }}>
            退出
          </button>
        </div>
      </div>
    </div>
    <div className="main">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>我的空间</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + 创建空间
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {spaces.map((space) => (
          <div
            key={space.id}
            className="card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/spaces/${space.id}`)}
          >
            <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
              📁 {space.name}
            </div>
            {space.description && (
              <div style={{ color: '#666', fontSize: 14 }}>{space.description}</div>
            )}
            {space.is_default && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#1890ff' }}>默认空间</div>
            )}
          </div>
          ))}
      </div>

      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: 400 }}>
            <h3 style={{ marginBottom: 16 }}>创建新空间</h3>
            <div className="form-group">
              <label>空间名称</label>
              <input
                type="text"
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
                placeholder="请输入空间名称"
              />
            </div>
            <div className="form-group">
              <label>空间描述</label>
              <textarea
                value={newSpaceDesc}
                onChange={(e) => setNewSpaceDesc(e.target.value)}
                placeholder="请输入空间描述（可选）"
                rows={3}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-default" onClick={() => setShowCreateModal(false)}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleCreateSpace} disabled={loading}>
                {loading ? '创建中...' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default Spaces;
