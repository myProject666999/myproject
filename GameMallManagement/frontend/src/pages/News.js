import React, { useState, useEffect } from 'react';
import { newsApi } from '../api';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const res = await newsApi.getAll();
        setNews(res.data);
      } catch (err) {
        console.error('加载资讯失败:', err);
      }
      setLoading(false);
    };
    loadNews();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>加载中...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container news-page">
      <h2 className="page-title">游戏资讯</h2>

      {news.length === 0 ? (
        <div className="empty-state">
          <h3>暂无资讯</h3>
        </div>
      ) : (
        <div>
          {news.map((item) => (
            <div key={item.id} className="news-card">
              <h3>{item.title}</h3>
              <div className="date">{formatDate(item.created_at)}</div>
              <div className="content">{item.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default News;
