import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyResult, setApplyResult] = useState(null);
  const lastViewedId = useRef(null);

  useEffect(() => {
    if (lastViewedId.current === id) {
      return;
    }
    lastViewedId.current = id;

    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${id}`);
        setJob(response.data.job);
      } catch (err) {
        console.error('Failed to fetch job:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'user') {
      alert('只有求职者可以投递简历');
      return;
    }

    setApplyLoading(true);
    try {
      await api.post(`/jobs/${id}/apply`, { message });
      setApplyResult({ success: true, message: '投递成功！' });
    } catch (err) {
      setApplyResult({ 
        success: false, 
        message: err.response?.data?.error || '投递失败' 
      });
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container">
        <div className="empty">
          <div className="empty-icon">❓</div>
          <p>职位不存在</p>
          <Link to="/jobs" className="btn btn-primary" style={{ marginTop: 16 }}>
            返回职位列表
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
            <h1 className="job-detail-title">{job.title}</h1>
            <span className="job-detail-salary">{job.salary_min}-{job.salary_max}K</span>
          </div>
          <div className="job-detail-tags">
            <span className="tag tag-info">{job.city}</span>
            <span className="tag tag-info">{job.experience}</span>
            <span className="tag tag-info">{job.education}</span>
          </div>
        </div>

        <div className="detail-content">
          <div className="detail-main">
            <div className="card">
              <h3 className="card-title">职位描述</h3>
              <p className="detail-text">{job.description || '暂无描述'}</p>
            </div>

            <div className="card">
              <h3 className="card-title">任职要求</h3>
              <p className="detail-text">{job.requirements || '暂无要求'}</p>
            </div>

            <div className="card">
              <h3 className="card-title">福利待遇</h3>
              <p className="detail-text">{job.benefits || '暂无福利信息'}</p>
            </div>
          </div>

          <div className="detail-sidebar">
            <div className="card company-card">
              <div className="company-header">
                <div className="company-logo-large">
                  {job.company?.name?.charAt(0) || '-'}
                </div>
                <div>
                  <h3 className="company-name">{job.company?.name || '未知企业'}</h3>
                  <p className="company-industry">{job.company?.industry}</p>
                </div>
              </div>
              <div className="company-info-list">
                <div className="info-item">
                  <span className="info-label">规模</span>
                  <span className="info-value">{job.company?.scale}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">城市</span>
                  <span className="info-value">{job.company?.city}</span>
                </div>
              </div>
              <Link to={`/companies/${job.company?.id}`} className="btn btn-default btn-block">
                查看企业详情
              </Link>
            </div>

            {user?.role === 'user' && (
              <div className="card">
                <h3 className="card-title">投递简历</h3>
                {applyResult ? (
                  <div className={applyResult.success ? 'success-message' : 'error-message'}>
                    {applyResult.message}
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label>留言（可选）</label>
                      <textarea
                        className="form-control"
                        placeholder="给HR留个言..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <button
                      className="btn btn-primary btn-block"
                      onClick={handleApply}
                      disabled={applyLoading}
                    >
                      {applyLoading ? '投递中...' : '立即投递'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetailPage;
