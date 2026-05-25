import React from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios.js';

export default function SupportOrder() {
  const { id, tierId } = useParams();
  const [tier, setTier] = React.useState(null);
  const [quantity, setQuantity] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    api
      .get(`/projects/${id}`)
      .then((res) => {
        const t = (res.data.tiers || []).find((x) => String(x.id) === String(tierId));
        if (!t) setError('档位不存在');
        setTier(t);
      })
      .catch(() => setError('加载项目信息失败'));
  }, [id, tierId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/support', { projectId: Number(id), tierId: Number(tierId), quantity });
      alert('支持成功！感谢您的支持 🎉');
      window.location.href = '/profile';
    } catch (err) {
      const msg = err.response?.data?.message || '下单失败，请先登录';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="page">
        <p style={{ color: '#ef4444' }}>{error}</p>
        <Link to={`/projects/${id}`}>返回项目</Link>
      </div>
    );
  }

  if (!tier) return <div className="page">加载中...</div>;

  return (
    <div className="page">
      <h2>确认支持</h2>
      <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>{tier.tierName}</h3>
        <p style={{ color: '#555' }}>{tier.description}</p>
        <p style={{ fontSize: 20, fontWeight: 600, color: '#2563eb' }}>¥{tier.amount.toLocaleString()} / 份</p>
        {tier.stock > 0 && (
          <p style={{ color: tier.stock - tier.soldCount > 10 ? '#22c55e' : '#f59e0b' }}>
            剩余库存: {tier.stock - tier.soldCount}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <label>
          支持数量
          <input
            type="number"
            min="1"
            max={tier.stock > 0 ? tier.stock - tier.soldCount : undefined}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          />
        </label>
        <p style={{ fontSize: 18, fontWeight: 600 }}>
          合计: ¥{(tier.amount * quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <button type="submit" disabled={loading}>
          {loading ? '处理中...' : '确认支持'}
        </button>
      </form>

      <div style={{ marginTop: 24 }}>
        <Link to={`/projects/${id}`}>← 返回项目</Link>
      </div>
    </div>
  );
}
