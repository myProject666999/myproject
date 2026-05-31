import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJielongList } from '../api/index.js';

export default function JielongList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadList();
  }, []);

  async function loadList() {
    try {
      const data = await getJielongList();
      setList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="empty-state">加载中...</div>;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h2 style={{ color: '#222' }}>全部接龙</h2>
        <Link to="/create" className="btn btn-primary btn-sm">
          + 创建接龙
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>还没有接龙，快来创建第一个吧！</p>
          <div style={{ marginTop: 20 }}>
            <Link to="/create" className="btn btn-primary">
              创建接龙
            </Link>
          </div>
        </div>
      ) : (
        <div className="jielong-list">
          {list.map((item) => (
            <Link
              key={item.id}
              to={`/jielong/${item.id}`}
              className="jielong-item"
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <h3 className="jielong-item-title">{item.title}</h3>
                <span
                  className={`status-badge ${
                    item.status === 'active'
                      ? 'status-active'
                      : 'status-closed'
                  }`}
                >
                  {item.status === 'active' ? '进行中' : '已截止'}
                </span>
              </div>
              {item.description && (
                <p className="jielong-item-desc">{item.description}</p>
              )}
              <div className="jielong-item-meta">
                <span>👥 {item.participant_count} 人</span>
                <span>{item.creator}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
