import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getJielong,
  getParticipants,
  addParticipant,
  deleteParticipant,
  closeJielong,
  deleteJielong,
  exportJielong,
} from '../api/index.js';
import { useSSE } from '../hooks/useSSE.js';

function getInputType(fieldType) {
  switch (fieldType) {
    case 'number':
      return 'number';
    case 'phone':
      return 'tel';
    case 'email':
      return 'email';
    default:
      return 'text';
  }
}

export default function JielongDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jielong, setJielong] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [j, p] = await Promise.all([getJielong(id), getParticipants(id)]);
      setJielong(j);
      setParticipants(p);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const connected = useSSE(`/api/jielong/${id}/stream`, (data) => {
    if (data.type === 'init' || data.type === 'update') {
      setParticipants(data.data);
      if (data.jielong) setJielong(data.jielong);
    }
  });

  const handleFieldChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jielong) return;
    for (const field of jielong.fields) {
      if (!formData[field.key] || !String(formData[field.key]).trim()) {
        alert(`请填写「${field.label}」`);
        return;
      }
    }
    setSubmitting(true);
    try {
      await addParticipant(id, formData);
      setFormData({});
      alert('报名成功！');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    if (!confirm('确定截止此接龙吗？截止后无法再报名。')) return;
    try {
      await closeJielong(id);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定删除此接龙吗？所有报名数据将被清除。')) return;
    try {
      await deleteJielong(id);
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemove = async (pid) => {
    if (!confirm('确定移除该报名者吗？')) return;
    try {
      await deleteParticipant(pid);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="empty-state">加载中...</div>;
  if (error) return <div className="empty-state">{error}</div>;
  if (!jielong) return <div className="empty-state">接龙不存在</div>;

  const isActive = jielong.status === 'active';

  return (
    <div>
      <div className="card">
        <div className="detail-header">
          <div style={{ flex: 1 }}>
            <h2 className="detail-title">{jielong.title}</h2>
            {jielong.description && (
              <p className="detail-desc">{jielong.description}</p>
            )}
            <div style={{ marginTop: 8 }}>
              <span
                className={`status-badge ${
                  isActive ? 'status-active' : 'status-closed'
                }`}
              >
                {isActive ? '进行中' : '已截止'}
              </span>
              {connected && (
                <span
                  className="realtime-indicator"
                  style={{ marginLeft: 12 }}
                >
                  <span className="dot" />
                  实时同步中
                </span>
              )}
            </div>
          </div>
          <div className="detail-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => exportJielong(id)}
            >
              导出 CSV
            </button>
            {isActive && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleClose}
              >
                截止接龙
              </button>
            )}
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleDelete}
            >
              删除
            </button>
          </div>
        </div>

        <div className="stats">
          <div className="stat-item">
            <span className="stat-value">{participants.length}</span>
            <span className="stat-label">报名人数</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{jielong.fields.length}</span>
            <span className="stat-label">字段数</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ fontSize: 14, color: '#888' }}>
              {jielong.creator}
            </span>
            <span className="stat-label">创建人</span>
          </div>
        </div>
      </div>

      {isActive && (
        <div className="card">
          <h3 className="card-title">我要报名</h3>
          <form onSubmit={handleSubmit}>
            {jielong.fields.map((field) => (
              <div key={field.key} className="form-group">
                <label className="form-label">
                  {field.label} <span style={{ color: '#f56c6c' }}>*</span>
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    className="form-textarea"
                    value={formData[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    placeholder={`请输入${field.label}`}
                  />
                ) : (
                  <input
                    className="form-input"
                    type={getInputType(field.type)}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    placeholder={`请输入${field.label}`}
                  />
                )}
              </div>
            ))}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? '提交中...' : '提交报名'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3 className="card-title">
          报名名单
          <span style={{ color: '#999', fontWeight: 'normal', marginLeft: 8 }}>
            共 {participants.length} 人
          </span>
        </h3>
        {participants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <p>暂无报名者</p>
          </div>
        ) : (
          <table className="participant-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>序号</th>
                {jielong.fields.map((f) => (
                  <th key={f.key}>{f.label}</th>
                ))}
                <th style={{ width: 80 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id}>
                  <td className="seq-cell">#{p.seq_no}</td>
                  {jielong.fields.map((f) => (
                    <td key={f.key}>{p.data[f.key] || '-'}</td>
                  ))}
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemove(p.id)}
                    >
                      移除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
