import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';

export default function CreateProject() {
  const navigate = useNavigate();
  const [title, setTitle] = React.useState('');
  const [subtitle, setSubtitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [goalAmount, setGoalAmount] = React.useState(1000);
  const [startAt, setStartAt] = React.useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [endAt, setEndAt] = React.useState('');
  const [tiers, setTiers] = React.useState([
    { tier_name: '', amount: 10, description: '', stock: 0 },
  ]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/projects', {
        title,
        subtitle,
        description,
        category,
        goal_amount: goalAmount,
        start_at: new Date(startAt).toISOString(),
        end_at: new Date(endAt).toISOString(),
        tiers,
      });
      navigate(`/projects/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || '创建失败，请先登录');
    } finally {
      setLoading(false);
    }
  };

  const updateTier = (idx, field, value) => {
    const next = tiers.slice();
    if (field === 'amount' || field === 'stock') {
      next[idx][field] = Number(value);
    } else {
      next[idx][field] = value;
    }
    setTiers(next);
  };

  return (
    <div className="page">
      <h2>发起众筹项目</h2>

      {error && <p style={{ color: '#ef4444', padding: 12, background: '#fef2f2', borderRadius: 6 }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          项目标题 *
          <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
        </label>

        <label>
          一句话简介
          <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} maxLength={300} placeholder="让支持者一眼了解你的项目" />
        </label>

        <label>
          详细介绍 *
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={8}
            placeholder="详细描述你的项目愿景、团队、进展等"
          />
        </label>

        <div style={{ display: 'flex', gap: 16 }}>
          <label style={{ flex: 1 }}>
            分类
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="如：科技、游戏、音乐" />
          </label>

          <label style={{ flex: 1 }}>
            目标金额 (¥) *
            <input type="number" step="0.01" min="1" value={goalAmount} onChange={(e) => setGoalAmount(Number(e.target.value))} required />
          </label>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <label style={{ flex: 1 }}>
            开始时间 *
            <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required />
          </label>

          <label style={{ flex: 1 }}>
            截止时间 *
            <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} required />
          </label>
        </div>

        <h3 style={{ marginTop: 24 }}>回报档位 *</h3>
        {tiers.map((tier, idx) => (
          <div key={idx} className="tier-form" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <input
              placeholder="档位名称"
              value={tier.tier_name}
              onChange={(e) => updateTier(idx, 'tier_name', e.target.value)}
              required
              style={{ flex: '1 1 150px' }}
            />
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="金额"
              value={tier.amount}
              onChange={(e) => updateTier(idx, 'amount', e.target.value)}
              required
              style={{ flex: '0 0 120px' }}
            />
            <input
              placeholder="回报说明"
              value={tier.description}
              onChange={(e) => updateTier(idx, 'description', e.target.value)}
              required
              style={{ flex: '2 1 200px' }}
            />
            <input
              type="number"
              min="0"
              placeholder="库存(0不限)"
              value={tier.stock}
              onChange={(e) => updateTier(idx, 'stock', e.target.value)}
              style={{ flex: '0 0 120px' }}
            />
            {tiers.length > 1 && (
              <button
                type="button"
                onClick={() => setTiers(tiers.filter((_, i) => i !== idx))}
                style={{ background: '#ef4444' }}
              >
                删除
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setTiers([...tiers, { tier_name: '', amount: 10, description: '', stock: 0 }])}
        >
          + 添加档位
        </button>

        <div style={{ marginTop: 24 }}>
          <button type="submit" disabled={loading}>
            {loading ? '提交中...' : '发布项目'}
          </button>
          <Link to="/" style={{ marginLeft: 12 }}>取消</Link>
        </div>
      </form>
    </div>
  );
}
