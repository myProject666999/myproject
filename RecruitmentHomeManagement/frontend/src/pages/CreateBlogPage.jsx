import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function CreateBlogPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/blogs', formData);
      alert('发布成功！等待管理员审核后显示');
      navigate('/blogs');
    } catch (err) {
      alert(err.response?.data?.error || '发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="jobs-page">
      <div className="container">
        <div className="page-header">
          <h2>发布博客</h2>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>文章标题 *</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="请输入文章标题"
              />
            </div>

            <div className="form-group">
              <label>标签（用逗号分隔）</label>
              <input
                type="text"
                name="tags"
                className="form-control"
                value={formData.tags}
                onChange={handleChange}
                placeholder="例如：职场,求职,面试"
              />
            </div>

            <div className="form-group">
              <label>文章内容 *</label>
              <textarea
                name="content"
                className="form-control"
                rows={15}
                value={formData.content}
                onChange={handleChange}
                required
                placeholder="请输入文章内容..."
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '发布中...' : '发布'}
            </button>
            <button
              type="button"
              className="btn btn-default"
              style={{ marginLeft: 12 }}
              onClick={() => navigate('/blogs')}
            >
              取消
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateBlogPage;
