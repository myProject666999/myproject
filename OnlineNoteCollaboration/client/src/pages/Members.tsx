import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { spacesApi } from '../api';

interface Member {
  id: number;
  user_id: number;
  user: {
    id: number;
    username: string;
    email: string;
    avatar: string;
  };
  role: number;
  joined_at: string;
}

const Members: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newUserRole, setNewUserRole] = useState(2);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadMembers();
    }
  }, [id]);

  const loadMembers = async () => {
    try {
      const response = await spacesApi.getMembers(Number(id));
      setMembers(response.data);
    } catch (err) {
      console.error('加载成员失败', err);
    }
  };

  const handleAddMember = async () => {
    if (!newUserId) return;
    setLoading(true);
    try {
      await spacesApi.addMember(Number(id), {
        user_id: Number(newUserId),
        role: newUserRole,
      });
      setShowAddModal(false);
      setNewUserId('');
      setNewUserRole(2);
      loadMembers();
    } catch (err: any) {
      alert(err.response?.data?.message || '添加成员失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: number, role: number) => {
    try {
      await spacesApi.updateMember(Number(id), userId, role);
      loadMembers();
    } catch (err: any) {
      alert(err.response?.data?.message || '更新角色失败');
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!confirm('确定要移除该成员吗？')) return;
    try {
      await spacesApi.removeMember(Number(id), userId);
      loadMembers();
    } catch (err: any) {
      alert(err.response?.data?.message || '移除成员失败');
    }
  };

  const getRoleName = (role: number) => {
    switch (role) {
      case 1: return '所有者';
      case 2: return '编辑者';
      case 3: return '只读';
      default: return '未知';
    }
  };

  const getRoleColor = (role: number) => {
    switch (role) {
      case 1: return '#f5222d';
      case 2: return '#1890ff';
      case 3: return '#52c41a';
      default: return '#999';
    }
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/spaces/${id}`)}>
            ← 返回
          </span>
        </div>
        <div className="sidebar-nav">
          <div style={{ padding: '10px 15px', fontSize: 12, color: '#999', textTransform: 'uppercase' }}>
            空间管理
          </div>
          <a
            onClick={() => navigate(`/spaces/${id}`)}
            style={{ cursor: 'pointer' }}
          >
            📄 文档列表
          </a>
          <a
            className="active"
            onClick={() => navigate(`/spaces/${id}/members`)}
            style={{ cursor: 'pointer' }}
          >
            👥 成员管理
          </a>
          <a
            onClick={() => navigate(`/spaces/${id}/recycle-bin`)}
            style={{ cursor: 'pointer' }}
          >
            🗑️ 回收站
          </a>
        </div>
        <div className="sidebar-footer">
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
        </div>
      </div>
      <div className="main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1>成员管理</h1>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            + 添加成员
          </button>
        </div>

        <div className="member-list">
          {members.map((member) => (
            <div key={member.id} className="member-item">
              <div className="member-avatar">
                {member.user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="member-info">
                <div className="name">{member.user?.username}</div>
                <div className="email">{member.user?.email}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <select
                  value={member.role}
                  onChange={(e) => handleUpdateRole(member.user_id, Number(e.target.value))}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: 4,
                    color: getRoleColor(member.role),
                    fontWeight: 500,
                  }}
                >
                  <option value={1}>所有者</option>
                  <option value={2}>编辑者</option>
                  <option value={3}>只读</option>
                </select>
                {member.role !== 1 && (
                  <button
                    className="btn btn-danger"
                    style={{ padding: '4px 8px', fontSize: 12 }}
                    onClick={() => handleRemoveMember(member.user_id)}
                  >
                    移除
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {showAddModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
          }}>
            <div className="card" style={{ width: 400 }}>
              <h3 style={{ marginBottom: 16 }}>添加成员</h3>
              <div className="form-group">
                <label>用户 ID</label>
                <input
                  type="number"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  placeholder="请输入用户 ID"
                />
              </div>
              <div className="form-group">
                <label>角色</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(Number(e.target.value))}
                >
                  <option value={2}>编辑者</option>
                  <option value={3}>只读</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="btn btn-default" onClick={() => setShowAddModal(false)}>
                  取消
                </button>
                <button className="btn btn-primary" onClick={handleAddMember} disabled={loading}>
                  {loading ? '添加中...' : '添加'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
