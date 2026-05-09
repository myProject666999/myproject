import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/jobs.css';

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    city: '',
    salary_min: '',
    salary_max: '',
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await api.get('/jobs', { params });
      setJobs(response.data.jobs || []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const cities = ['', '北京', '上海', '杭州', '深圳', '广州', '成都', '南京', '武汉'];

  return (
    <div className="jobs-page">
      <div className="container">
        <div className="page-header">
          <h2>职位招聘</h2>
        </div>

        <div className="search-card">
          <form onSubmit={handleSearch}>
            <div className="search-row">
              <input
                type="text"
                name="keyword"
                className="form-control"
                placeholder="搜索职位名称或关键词"
                value={filters.keyword}
                onChange={handleInputChange}
              />
              <select
                name="city"
                className="form-control"
                value={filters.city}
                onChange={handleInputChange}
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city || '全部城市'}</option>
                ))}
              </select>
              <select
                name="salary_min"
                className="form-control"
                value={filters.salary_min}
                onChange={handleInputChange}
              >
                <option value="">最低薪资</option>
                <option value="10000">10K以上</option>
                <option value="20000">20K以上</option>
                <option value="30000">30K以上</option>
                <option value="50000">50K以上</option>
              </select>
              <button type="submit" className="btn btn-primary">
                搜索
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="loading">加载中...</div>
        ) : jobs.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📭</div>
            <p>暂无职位信息</p>
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
                      <span className="job-tag">{job.education}</span>
                    </div>
                  </div>
                  <div className="job-right">
                    <span className="job-salary">{job.salary_min}-{job.salary_max}K</span>
                  </div>
                </div>
                <div className="job-footer">
                  <div className="company-info">
                    <div className="company-logo-small">
                      {job.company?.name?.charAt(0) || '-'}
                    </div>
                    <div>
                      <div className="company-name">{job.company?.name || '未知企业'}</div>
                      <div className="company-meta">
                        {job.company?.industry} · {job.company?.scale}
                      </div>
                    </div>
                  </div>
                  <div className="job-time">
                    浏览 {job.views} 次
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobsPage;
