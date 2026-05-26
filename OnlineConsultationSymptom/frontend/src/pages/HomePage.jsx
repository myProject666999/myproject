import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articleApi } from '../utils/api.js';

function HomePage() {
  const [popularArticles, setPopularArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPopularArticles();
  }, []);

  const loadPopularArticles = async () => {
    try {
      const data = await articleApi.getPopular(5);
      setPopularArticles(data);
    } catch (error) {
      console.error('加载热门文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="home-actions">
        <Link to="/symptom-check" className="action-card">
          <div className="action-card-icon">🔍</div>
          <h3>症状自查</h3>
          <p>选择您的症状，系统将为您分析可能的疾病</p>
        </Link>
        <Link to="/qa" className="action-card">
          <div className="action-card-icon">💬</div>
          <h3>问答式自查</h3>
          <p>通过回答问题，获得更精准的诊断建议</p>
        </Link>
        <Link to="/articles" className="action-card">
          <div className="action-card-icon">📚</div>
          <h3>健康知识</h3>
          <p>浏览健康科普文章，了解常见疾病知识</p>
        </Link>
      </div>

      <div className="card">
        <h2 className="card-title">🔥 热门文章</h2>
        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <div className="popular-articles">
            {popularArticles.map((article, index) => (
              <Link 
                key={article.id} 
                to={`/articles/${article.id}`}
                className="popular-article-item"
                style={{ textDecoration: 'none' }}
              >
                <span className="popular-article-rank">{index + 1}</span>
                <span className="popular-article-title">{article.title}</span>
                <span className="popular-article-views">👁 {article.view_count}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">⚠️ 重要提示</h2>
        <div className="disclaimer">
          <strong>免责声明：</strong>本系统提供的所有诊断结果和建议仅供参考，不能替代专业医疗诊断、治疗或医生的专业意见。如有身体不适，请及时到正规医疗机构就诊。本系统不对因使用本系统信息而产生的任何后果承担责任。
        </div>
      </div>
    </div>
  );
}

export default HomePage;
