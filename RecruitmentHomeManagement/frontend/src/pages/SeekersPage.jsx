import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function SeekersPage() {
  const [seekers, setSeekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    city: '',
    experience: '',
  });

  const fetchSeekers = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await api.get('/seekers', { params });
      setSeekers(response.data.seekers || []);
    } catch (err) {
      console.error('Failed to fetch seekers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeekers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSeekers();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="jobs-page">
      <div className="container">
        <div className="page-header">
          <h2>求职信息</h2>
        </div>

        <div className="search-card">
          <form onSubmit={handleSearch}>
            <div className="search-row">
              <input
                type="text"
                name="keyword"
                className="form-control"
                placeholder="搜索求职意向..."
                value={filters.keyword}
                onChange={handleInputChange}
              />
              <select
                name="city"
                className="form-control"
                value={filters.city}
                onChange={handleInputChange}
              >
                <option value="">全部城市</option>
                <option value="北京">北京</option>
                <option value="上海">上海</option>
                <option value="杭州">杭州</option>
                <option value="深圳">深圳</option>
                <option value="广州">广州</option>
              </select>
              <button type="submit" className="btn btn-primary">
                搜索
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="loading">加载中...</div>
        ) : seekers.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">👤</div>
            <p>暂无求职信息</p>
          </div>
        ) : (
          <div className="job-list">
            {seekers.map((seeker) => (
              <Link to={`/seekers/${seeker.id}`} key={seeker.id} className="job-item">
                <div className="job-main">
                  <div className="job-left">
                    <h3 className="job-title">{seeker.title}</h3>
                    <div className="job-tags">
                      <span className="job-tag">{seeker.expected_position}</span>
                      <span className="job-tag">{seeker.city}</span>
                      <span className="job-tag">{seeker.experience}</span>
                      <span className="job-tag">{seeker.education}</span>
                    </div>
                  </div>
                  <div className="job-right">
                    {seeker.salary_min > 0 && (
                      <span className="job-salary">{seeker.salary_min}-{seeker.salary_max}K</span>
                    )}
                  </div>
                </div>
                <div className="job-footer">
                  <span>
                    {seeker.user?.name || '匿名'} | 技能：{seeker.skills || '未填写'}
                  </span>
                  <span>浏览 {seeker.views} 次</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SeekersPage;
