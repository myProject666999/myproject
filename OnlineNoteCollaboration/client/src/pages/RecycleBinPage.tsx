import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { recycleBinApi, documentsApi } from '../api';
import dayjs from 'dayjs';

interface RecycleItem {
  id: number;
  document_id: number;
  original_title: string;
  original_content: string;
  deleted_by: number;
  expire_at: string;
  created_at: string;
}

const RecycleBinPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<RecycleItem[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadRecycleBin();
    }
  }, [id]);

  const loadRecycleBin = async () => {
    try {
      const response = await recycleBinApi.list(Number(id));
      setItems(response.data);
    } catch (err) {
      console.error('加载回收站失败', err);
    }
  };

  const handleRestore = async (itemId: number) => {
    try {
      await recycleBinApi.restore(itemId);
      alert('恢复成功');
      loadRecycleBin();
    } catch (err: any) {
      alert(err.response?.data?.message || '恢复失败');
    }
  };

  const handlePermanentDelete = async (itemId: number) => {
    if (!confirm('确定要永久删除吗？此操作不可恢复！')) return;
    try {
      await recycleBinApi.delete(itemId);
      alert('已永久删除');
      loadRecycleBin();
    } catch (err: any) {
      alert(err.response?.data?.message || '删除失败');
    }
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/spaces/${id}`)}>
            ← 返回
          </span>
        </div>
        <div className="sidebar-nav">
          <div style={{ padding: '10px 15px', fontSize: 12, color: '#999', textTransform: 'uppercase' }}>
            空间管理
          </div>
          <a
            onClick={() => navigate(`/spaces/${id}`)}
            style={{ cursor: 'pointer' }}
          >
            📄 文档列表
          </a>
          <a
            onClick={() => navigate(`/spaces/${id}/members`)}
            style={{ cursor: 'pointer' }}
          >
            👥 成员管理
          </a>
          <a
            className="active"
            onClick={() => navigate(`/spaces/${id}/recycle-bin`)}
            style={{ cursor: 'pointer' }}
          >
            🗑️ 回收站
          </a>
        </div>
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#1890ff', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', marginRight: 8
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <span>{user?.username}</span>
          </div>
        </div>
      </div>
      <div className="main">
        <div style={{ marginBottom: 24 }}>
          <h1>回收站</h1>
          <p style={{ color: '#666', marginTop: 8 }}>
            回收站中的文档将在 30 天后自动永久删除
          </p>
        </div>

        {items.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: '#999', padding: 40 }}>
            🗑️ 回收站为空
          </div>
        ) : (
          <div>
            {items.map((item) => (
              <div key={item.id} className="recycle-item">
                <div className="recycle-info">
                  <div className="title">📄 {item.original_title}</div>
                  <div className="time">
                    删除于 {dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
                    {item.expire_at && (
                      <span style={{ marginLeft: 12, color: '#faad14' }}>
                        将于 {dayjs(item.expire_at).format('YYYY-MM-DD')} 过期
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: 13 }}
                    onClick={() => handleRestore(item.id)}
                  >
                    恢复
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '6px 12px', fontSize: 13 }}
                    onClick={() => handlePermanentDelete(item.id)}
                  >
                    永久删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecycleBinPage;
