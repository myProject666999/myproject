import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/user.css';

function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  const fetchBlogs = async () => {
    try {
      const params = keyword ? { keyword } : {};
      const response = await api.get('/blogs', { params });
      setBlogs(response.data.blogs || []);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBlogs();
  };

  return (
    <div className="jobs-page">
      <div className="container">
        <div className="page-header">
          <h2>职场博客</h2>
          <Link to="/blog/create" className="btn btn-primary">
            发布文章
          </Link>
        </div>

        <div className="search-card">
          <form onSubmit={handleSearch}>
            <div className="search-row">
              <input
                type="text"
                className="form-control"
                placeholder="搜索博客标题或内容..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                搜索
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="loading">加载中...</div>
        ) : blogs.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📚</div>
            <p>暂无博客文章</p>
          </div>
        ) : (
          <div className="blog-list">
            {blogs.map((blog) => (
              <Link to={`/blogs/${blog.id}`} key={blog.id} className="blog-card">
                <h3>{blog.title}</h3>
                <p className="blog-excerpt">{blog.content}</p>
                <div className="blog-meta">
                  <span>{blog.user?.name || '匿名'}</span>
                  <span>浏览 {blog.views} 次</span>
                </div>
                {blog.tags && (
                  <div className="blog-tags" style={{ marginTop: 12 }}>
                    {blog.tags.split(',').map((tag, idx) => (
                      <span key={idx} className="tag tag-info">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BlogsPage;
