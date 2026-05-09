import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function CompanyDetailPage() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await api.get(`/companies/${id}`);
        setCompany(response.data.company);
        setJobs(response.data.jobs || []);
      } catch (err) {
        console.error('Failed to fetch company:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container">
        <div className="empty">
          <div className="empty-icon">❓</div>
          <p>企业不存在</p>
          <Link to="/companies" className="btn btn-primary" style={{ marginTop: 16 }}>
            返回企业列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="job-detail-page">
      <div className="container">
        <div className="card">
          <div className="company-header" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div className="company-logo-large">
              {company.name.charAt(0)}
            </div>
            <div>
              <h1 style={{ fontSize: 28, marginBottom: 8 }}>{company.name}</h1>
              <div style={{ display: 'flex', gap: 16, color: '#8c8c8c' }}>
                <span>{company.industry}</span>
                <span>{company.scale}</span>
                <span>{company.city}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-content">
          <div className="detail-main">
            <div className="card">
              <h3 className="card-title">企业介绍</h3>
              <p className="detail-text">{company.description || '暂无介绍'}</p>
            </div>

            <div className="card">
              <h3 className="card-title">在招职位 ({jobs.length})</h3>
              {jobs.length === 0 ? (
                <div className="empty" style={{ padding: '40px 20px' }}>
                  暂无在招职位
                </div>
              ) : (
                <div className="job-list">
                  {jobs.map((job) => (
                    <Link to={`/jobs/${job.id}`} key={job.id} className="job-item">
                      <div className="job-main">
                        <div className="job-left">
                          <h3 className="job-title">{job.title}</h3>
                          <div className="job-tags">
                            <span className="job-tag">{job.city}</span>
                            <span className="job-tag">{job.experience}</span>
                          </div>
                        </div>
                        <div className="job-right">
                          <span className="job-salary">{job.salary_min}-{job.salary_max}K</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="detail-sidebar">
            <div className="card">
              <h3 className="card-title">企业信息</h3>
              <div className="company-info-list">
                <div className="info-item">
                  <span className="info-label">地址</span>
                  <span className="info-value">{company.address || '-'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">官网</span>
                  <span className="info-value">{company.website || '-'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">认证状态</span>
                  <span className={`tag ${company.verified ? 'tag-success' : 'tag-warning'}`}>
                    {company.verified ? '已认证' : '未认证'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyDetailPage;
