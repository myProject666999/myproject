import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { articleApi } from '../utils/api.js';

function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      const data = await articleApi.getById(id);
      setArticle(data);
    } catch (error) {
      console.error('加载文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!article) {
    return (
      <div className="card">
        <p>文章不存在</p>
        <Link to="/articles" className="back-link">← 返回文章列表</Link>
      </div>
    );
  }

  return (
    <div className="article-detail">
      <Link to="/articles" className="back-link">← 返回文章列表</Link>
      
      <div className="card">
        <h1 className="article-detail-title">{article.title}</h1>
        <div className="article-detail-meta">
          <span>👤 {article.author}</span>
          <span style={{ marginLeft: 20 }}>📂 {article.category}</span>
          <span style={{ marginLeft: 20 }}>👁 {article.view_count}次阅读</span>
          <span style={{ marginLeft: 20 }}>📅 {formatDate(article.publish_time)}</span>
        </div>
        
        <div className="article-content">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>
      </div>

      <div className="disclaimer">
        <strong>⚠️ 免责声明：</strong>本文内容仅供健康科普参考，不能替代专业医疗诊断。如有不适，请及时就医。
      </div>
    </div>
  );
}

export default ArticleDetailPage;
