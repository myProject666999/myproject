import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function SeekerDetailPage() {
  const { id } = useParams();
  const [seeker, setSeeker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeeker = async () => {
      try {
        const response = await api.get(`/seekers/${id}`);
        setSeeker(response.data.seeker);
      } catch (err) {
        console.error('Failed to fetch seeker:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeeker();
  }, [id]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (!seeker) {
    return (
      <div className="container">
        <div className="empty">
          <div className="empty-icon">❓</div>
          <p>求职信息不存在</p>
          <Link to="/seekers" className="btn btn-primary" style={{ marginTop: 16 }}>
            返回求职列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="job-detail-page">
      <div className="container">
        <div className="job-detail-header">
          <div className="job-header-main">
            <h1 className="job-detail-title">{seeker.title}</h1>
          </div>
          <div className="job-detail-tags">
            <span className="tag tag-info">{seeker.expected_position}</span>
            <span className="tag tag-info">{seeker.city}</span>
            {seeker.salary_min > 0 && (
              <span className="tag tag-success">{seeker.salary_min}-{seeker.salary_max}K</span>
            )}
            <span className="tag tag-warning">{seeker.experience}</span>
            <span className="tag tag-warning">{seeker.education}</span>
          </div>
        </div>

        <div className="detail-content">
          <div className="detail-main">
            <div className="card">
              <h3 className="card-title">个人简介</h3>
              <p className="detail-text">{seeker.description || '暂无描述'}</p>
            </div>

            {seeker.skills && (
              <div className="card">
                <h3 className="card-title">技能专长</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {seeker.skills.split(',').map((skill, idx) => (
                    <span key={idx} className="tag tag-info">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {seeker.resume && (
              <div className="card">
                <h3 className="card-title">简历链接</h3>
                <a href={seeker.resume} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  查看简历
                </a>
              </div>
            )}
          </div>

          <div className="detail-sidebar">
            <div className="card company-card">
              <div className="company-header">
                <div className="company-logo-large">
                  {seeker.user?.name?.charAt(0) || '-'}
                </div>
                <div>
                  <h3 className="company-name">{seeker.user?.name || '匿名'}</h3>
                  <p className="company-industry">{seeker.user?.email}</p>
                </div>
              </div>
              <div className="company-info-list">
                {seeker.user?.phone && (
                  <div className="info-item">
                    <span className="info-label">电话</span>
                    <span className="info-value">{seeker.user.phone}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">浏览次数</span>
                  <span className="info-value">{seeker.views} 次</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeekerDetailPage;
