import React, { useState, useEffect } from 'react';
import { newsApi } from '../../api';

const AdminNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  const loadNews = async () => {
    try {
      const res = await newsApi.getAll();
      setNews(res.data);
    } catch (err) {
      console.error('加载资讯失败:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
  }, []);

  const openCreateModal = () => {
    setEditingNews(null);
    setFormData({ title: '', content: '' });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingNews(item);
    setFormData({ title: item.title, content: item.content });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNews) {
        await newsApi.update(editingNews.id, formData);
        alert('资讯更新成功！');
      } else {
        await newsApi.create(formData);
        alert('资讯创建成功！');
      }
      setShowModal(false);
      loadNews();
    } catch (err) {
      alert(err.response?.data?.error || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这篇资讯吗？')) return;
    try {
      await newsApi.delete(id);
      loadNews();
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
        <h2>资讯管理</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={openCreateModal}
        >
          + 发布资讯
        </button>
      </div>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>标题</th>
              <th>内容</th>
              <th>发布时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {news.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td style={{ maxWidth: '200px' }}>{item.title}</td>
                <td style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.content}
                </td>
                <td>{formatDate(item.created_at)}</td>
                <td>
                  <div className="actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEditModal(item)}
                    >
                      编辑
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingNews ? '编辑资讯' : '发布资讯'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="请输入资讯标题"
                />
              </div>
              <div className="form-group">
                <label>内容</label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={6}
                  placeholder="请输入资讯内容"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowModal(false)}
                >
                  取消
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingNews ? '保存' : '发布'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNews;
