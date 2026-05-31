import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getJielongList } from '../api/index.js';

export default function MyJielongs() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState('');
  const [inputValue, setInputValue] = useState('');

  const loadMyList = useCallback(async (name) => {
    setLoading(true);
    try {
      const data = await getJielongList({ creator: name });
      setList(data);
    } catch (err) {
      console.error(err);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const name = localStorage.getItem('jl_creator') || '';
    if (name) {
      setCreator(name);
      setInputValue(name);
      loadMyList(name);
    } else {
      setLoading(false);
    }
  }, [loadMyList]);

  const handleNameSubmit = () => {
    const name = inputValue.trim();
    if (!name) {
      alert('请输入昵称');
      return;
    }
    localStorage.setItem('jl_creator', name);
    setCreator(name);
    loadMyList(name);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNameSubmit();
    }
  };

  const handleSwitch = () => {
    localStorage.removeItem('jl_creator');
    setCreator('');
    setInputValue('');
    setList([]);
  };

  if (loading) return <div className="empty-state">加载中...</div>;

  if (!creator) {
    return (
      <div className="card">
        <h2 className="card-title">我的接龙</h2>
        <p style={{ color: '#777', marginBottom: 20 }}>
          请输入创建人昵称以查看你创建的接龙
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="form-input"
            style={{ maxWidth: 300 }}
            placeholder="输入你的昵称"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={20}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNameSubmit}
          >
            查看
          </button>
        </div>
      </div>
    );
  }

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
        <h2 style={{ color: '#222' }}>我的接龙</h2>
        <span style={{ color: '#888', fontSize: 14 }}>
          创建人: <strong style={{ color: '#333' }}>{creator}</strong>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ marginLeft: 12 }}
            onClick={handleSwitch}
          >
            切换
          </button>
        </span>
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p>你还没有创建任何接龙</p>
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
                <span>{item.created_at?.slice(0, 10)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
