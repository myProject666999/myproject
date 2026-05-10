import React, { useState, useEffect } from 'react';
import { userApi } from '../../api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const res = await userApi.getAll();
      setUsers(res.data);
    } catch (err) {
      console.error('加载用户失败:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个用户吗？')) return;
    try {
      await userApi.delete(id);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || '删除失败');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="empty-state">
        <h3>加载中...</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-header">
        <h2>用户管理</h2>
      </div>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>角色</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '15px',
                      fontSize: '12px',
                      background: user.role === 'admin' ? '#ffe6e6' : '#e9ecef',
                      color: user.role === 'admin' ? '#eb3349' : '#666',
                    }}
                  >
                    {user.role === 'admin' ? '管理员' : '普通用户'}
                  </span>
                </td>
                <td>{formatDate(user.created_at)}</td>
                <td>
                  {user.role === 'admin' ? (
                    <span style={{ color: '#999' }}>不可删除</span>
                  ) : (
                    <div className="actions">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        删除
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
