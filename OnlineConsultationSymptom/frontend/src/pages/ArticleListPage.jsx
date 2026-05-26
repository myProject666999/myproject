import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articleApi } from '../utils/api.js';

function ArticleListPage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadArticles();
  }, [selectedCategory, page]);

  const loadCategories = async () => {
    try {
      const data = await articleApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const loadArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, pageSize: 10 };
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      const data = await articleApi.getAll(params);
      setArticles(data.list);
      setTotal(data.total);
    } catch (error) {
      console.error('加载文章失败:', error);
      setError(error.message || '加载文章失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div>
      <div className="card">
        <h2 className="card-title">📚 健康知识文章</h2>
        
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <button 
            className={`btn ${selectedCategory === '' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setSelectedCategory(''); setPage(1); }}
          >
            全部
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setSelectedCategory(cat); setPage(1); }}
            >
              {cat}
            </button>
          ))}
        </div>

        {error ? (
          <div className="error-message" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: 16 }}>⚠️</div>
            <p style={{ marginBottom: 16, color: '#e74c3c' }}>{error}</p>
            <button className="btn btn-primary" onClick={loadArticles}>
              🔄 重新加载
            </button>
          </div>
        ) : loading ? (
          <div className="loading">加载中...</div>
        ) : articles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>暂无文章</p>
          </div>
        ) : (
          <div className="article-list">
            {articles.map(article => (
              <Link 
                key={article.id} 
                to={`/articles/${article.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="article-card">
                  <span className="article-category">{article.category}</span>
                  <h3 className="article-title">{article.title}</h3>
                  <p className="article-summary">{article.summary}</p>
                  <div className="article-meta">
                    <span>👤 {article.author}</span>
                    <span>👁 {article.view_count}次阅读</span>
                    <span>📅 {formatDate(article.publish_time)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              上一页
            </button>
            <span style={{ alignSelf: 'center' }}>{page} / {totalPages}</span>
            <button 
              className="btn btn-secondary"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              下一页
            </button>
          </div>
        )}
      </div>

      <div className="disclaimer">
        <strong>⚠️ 免责声明：</strong>本文内容仅供健康科普参考，不能替代专业医疗诊断。如有不适，请及时就医。
      </div>
    </div>
  );
}

export default ArticleListPage;
