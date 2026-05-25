import React from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = React.useState(null);
  const [progress, setProgress] = React.useState(null);
  const [updates, setUpdates] = React.useState([]);
  const [comments, setComments] = React.useState([]);
  const [commentText, setCommentText] = React.useState('');
  const [updateTitle, setUpdateTitle] = React.useState('');
  const [updateContent, setUpdateContent] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setError('');
    api
      .get(`/projects/${id}`)
      .then((res) => setProject(res.data))
      .catch(() => setError('加载项目失败'));

    api
      .get(`/projects/${id}/progress`)
      .then((res) => setProgress(res.data))
      .catch(() => {});

    api
      .get(`/project-updates/${id}/updates`)
      .then((res) => setUpdates(res.data || []))
      .catch(() => {});

    api
      .get(`/project-comments/${id}/comments`)
      .then((res) => setComments(res.data.list || []))
      .catch(() => {});
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/project-comments/${id}/comments`, { content: commentText, type: 0 });
      setCommentText('');
      const res = await api.get(`/project-comments/${id}/comments`);
      setComments(res.data.list || []);
    } catch (err) {
      alert(err.response?.data?.message || '评论失败，请先登录');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/project-updates/${id}/updates`, { title: updateTitle, content: updateContent });
      setUpdateTitle('');
      setUpdateContent('');
      const res = await api.get(`/project-updates/${id}/updates`);
      setUpdates(res.data || []);
    } catch (err) {
      alert(err.response?.data?.message || '发布失败（仅项目发起人可发布动态）');
    }
  };

  if (error) return <div className="page"><p style={{ color: '#ef4444' }}>{error}</p><Link to="/">返回列表</Link></div>;
  if (!project) return <div className="page">加载中...</div>;

  const statusText = (s) => {
    const map = { 0: '筹款中', 1: '已达成', 2: '失败', 3: '已取消' };
    return map[s] || '未知';
  };

  return (
    <div className="page">
      <h2>{project.title}</h2>
      {project.subtitle && <p style={{ color: '#666', fontSize: 16 }}>{project.subtitle}</p>}
      {project.category && <span style={{ background: '#eef2ff', color: '#4f46e5', padding: '2px 8px', borderRadius: 10, fontSize: 12 }}>{project.category}</span>}

      {progress && (
        <div className="progress-box">
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            ¥{progress.raisedAmount.toLocaleString()} <span style={{ color: '#999', fontSize: 14 }}>/ ¥{progress.goalAmount.toLocaleString()}</span>
          </div>
          <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
            {progress.backerCount} 人支持 · {statusText(progress.status)}
          </div>
          <div className="progress-bar">
            <div style={{ width: `${progress.percent}%` }} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#2563eb' }}>{progress.percent}%</div>
        </div>
      )}

      <h3>项目介绍</h3>
      <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{project.description}</p>

      <section style={{ marginTop: 24 }}>
        <h3>回报档位</h3>
        <ul>
          {(project.tiers || []).map((tier) => (
            <li key={tier.id} className="tier">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 16 }}>{tier.tierName}</strong>
                <span style={{ fontSize: 18, fontWeight: 600, color: '#2563eb' }}>¥{tier.amount.toLocaleString()}</span>
              </div>
              <p style={{ color: '#555' }}>{tier.description}</p>
              {tier.stock > 0 && (
                <p style={{ fontSize: 13, color: tier.stock - tier.soldCount > 0 ? '#22c55e' : '#ef4444' }}>
                  剩余库存: {tier.stock - tier.soldCount} / {tier.stock}
                </p>
              )}
              {tier.stock === 0 && <p style={{ fontSize: 13, color: '#666' }}>不限数量</p>}
              <div style={{ marginTop: 8 }}>
                <Link to={`/projects/${id}/support/${tier.id}`}>
                  <button>支持此档位</button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>项目动态 ({updates.length})</h3>
        {updates.length === 0 && <p style={{ color: '#999' }}>暂无动态</p>}
        <ul>
          {updates.map((u) => (
            <li key={u.id} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
              <strong>{u.title}</strong>
              <p style={{ color: '#555', whiteSpace: 'pre-wrap' }}>{u.content}</p>
              <small style={{ color: '#999' }}>{new Date(u.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: 'pointer', color: '#2563eb' }}>发布动态（仅项目发起人）</summary>
          <form onSubmit={handleUpdate} style={{ marginTop: 12 }}>
            <input
              placeholder="动态标题"
              value={updateTitle}
              onChange={(e) => setUpdateTitle(e.target.value)}
              required
              style={{ width: '100%', marginBottom: 8 }}
            />
            <textarea
              placeholder="动态内容"
              value={updateContent}
              onChange={(e) => setUpdateContent(e.target.value)}
              required
              style={{ width: '100%', minHeight: 80, marginBottom: 8 }}
            />
            <button type="submit">发布</button>
          </form>
        </details>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>评论 ({comments.length})</h3>
        {comments.length === 0 && <p style={{ color: '#999' }}>暂无评论，来发表第一条吧！</p>}
        <ul>
          {comments.map((c) => (
            <li key={c.id} style={{ borderBottom: '1px solid #f3f4f6', padding: '12px 0' }}>
              <p>{c.content}</p>
              <small style={{ color: '#999' }}>
                用户 {c.userId} · {new Date(c.createdAt).toLocaleString()}
                {c.isAnswered === 1 && <span style={{ color: '#22c55e', marginLeft: 8 }}>✓ 作者已回复</span>}
              </small>
            </li>
          ))}
        </ul>
        <form onSubmit={handleComment} style={{ marginTop: 16 }}>
          <input
            placeholder="写下你的评论或提问..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            required
            style={{ width: '70%', marginRight: 8 }}
          />
          <button type="submit">发表</button>
        </form>
      </section>

      <div style={{ marginTop: 24 }}>
        <Link to="/">← 返回列表</Link>
      </div>
    </div>
  );
}
