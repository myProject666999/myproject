import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function BlogDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await api.get(`/blogs/${id}`);
        setBlog(response.data.blog);
        setLikes(response.data.blog.likes);
      } catch (err) {
        console.error('Failed to fetch blog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const response = await api.post(`/blogs/${id}/like`);
      setLikes(response.data.likes);
    } catch (err) {
      console.error('Failed to like:', err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container">
        <div className="empty">
          <div className="empty-icon">❓</div>
          <p>文章不存在</p>
          <Link to="/blogs" className="btn btn-primary" style={{ marginTop: 16 }}>
            返回博客列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <div className="container">
        <div className="card">
          <h1 className="blog-detail-title">{blog.title}</h1>
          <div className="blog-detail-author">
            作者：{blog.user?.name || '匿名'} | 发布于：{new Date(blog.createdAt).toLocaleDateString()}
          </div>
          <div className="blog-detail-content">
            {blog.content}
          </div>
          {blog.tags && (
            <div className="blog-detail-footer">
              <div className="blog-tags">
                {blog.tags.split(',').map((tag, idx) => (
                  <span key={idx} className="tag tag-info">
                    {tag.trim()}
                  </span>
                ))}
              </div>
              <div className="blog-actions">
                <span>浏览 {blog.views} 次</span>
                <button className="btn btn-default" onClick={handleLike}>
                  ❤️ {likes}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BlogDetailPage;
