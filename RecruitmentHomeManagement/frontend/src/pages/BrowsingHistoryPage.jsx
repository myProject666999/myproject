import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function BrowsingHistoryPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/history');
        setJobs(response.data.jobs || []);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="user-page">
      <div className="container">
        <div className="page-header">
          <h2>浏览历史</h2>
        </div>

        {loading ? (
          <div className="loading">加载中...</div>
        ) : jobs.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🕐</div>
            <p>暂无浏览记录</p>
          </div>
        ) : (
          <div className="card">
            {jobs.map((job) => (
              <div key={job.id} className="history-item">
                <Link to={`/jobs/${job.id}`} className="history-info">
                  <h4>{job.title}</h4>
                  <p>
                    {job.company?.name} · {job.city} · {job.salary_min}-{job.salary_max}K
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowsingHistoryPage;
