import React from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function ProjectList() {
  const [projects, setProjects] = React.useState([]);
  const [keyword, setKeyword] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    setError('');
    const params = {};
    if (keyword) params.keyword = keyword;
    if (status !== '') params.status = status;
    api
      .get('/projects', { params })
      .then((res) => setProjects(res.data.list || []))
      .catch(() => setError('加载项目失败，请稍后重试'))
      .finally(() => setLoading(false));
  }, [keyword, status]);

  const statusText = (s) => {
    const map = { 0: '筹款中', 1: '已达成', 2: '失败', 3: '已取消' };
    return map[s] || '未知';
  };

  const statusColor = (s) => {
    const map = { 0: '#22c55e', 1: '#3b82f6', 2: '#ef4444', 3: '#6b7280' };
    return map[s] || '#6b7280';
  };

  return (
    <div className="page">
      <h2>众筹项目列表</h2>
      <div className="filters">
        <input
          type="text"
          placeholder="搜索关键词..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">全部状态</option>
          <option value="0">筹款中</option>
          <option value="1">已达成</option>
          <option value="2">失败</option>
          <option value="3">已取消</option>
        </select>
      </div>

      {loading && <p>加载中...</p>}
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}

      {!loading && !error && (
        <ul className="project-list">
          {projects.length === 0 && <p>暂无项目</p>}
          {projects.map((p) => {
            const percent = p.goalAmount > 0
              ? Math.min(100, (p.raisedAmount / p.goalAmount) * 100)
              : 0;
            return (
              <li key={p.id} className="project-card">
                <Link to={`/projects/${p.id}`} style={{ fontSize: 16, fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>
                  {p.title}
                </Link>
                {p.subtitle && <p style={{ color: '#666', fontSize: 13, margin: '4px 0' }}>{p.subtitle}</p>}
                {p.category && <span style={{ background: '#eef2ff', color: '#4f46e5', padding: '2px 8px', borderRadius: 10, fontSize: 12 }}>{p.category}</span>}
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', marginBottom: 4 }}>
                    <span>¥{p.raisedAmount.toLocaleString()} / ¥{p.goalAmount.toLocaleString()}</span>
                    <span style={{ color: statusColor(p.status) }}>{statusText(p.status)}</span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #2563eb)', transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                    {p.backerCount} 人支持 · {percent.toFixed(1)}%
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
