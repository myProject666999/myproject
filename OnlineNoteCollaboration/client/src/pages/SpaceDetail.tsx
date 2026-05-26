import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { spacesApi, documentsApi } from '../api';
import dayjs from 'dayjs';

interface Document {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const SpaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [space, setSpace] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadSpace();
      loadDocuments();
    }
  }, [id]);

  const loadSpace = async () => {
    try {
      const response = await spacesApi.get(Number(id));
      setSpace(response.data);
    } catch (err) {
      console.error('加载空间失败', err);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await documentsApi.list(Number(id));
      setDocuments(response.data);
    } catch (err) {
      console.error('加载文档失败', err);
    }
  };

  const handleCreateDoc = async () => {
    if (!newDocTitle.trim()) return;
    setLoading(true);
    try {
      const response = await documentsApi.create({
        space_id: Number(id),
        title: newDocTitle,
      });
      setShowCreateModal(false);
      setNewDocTitle('');
      navigate(`/documents/${response.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || '创建文档失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoc = async (docId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除此文档吗？')) return;
    try {
      await documentsApi.delete(docId);
      loadDocuments();
    } catch (err: any) {
      alert(err.response?.data?.message || '删除失败');
    }
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/spaces')}>
            ← 返回
          </span>
        </div>
        <div className="sidebar-nav">
          <div style={{ padding: '10px 15px', fontSize: 12, color: '#999', textTransform: 'uppercase' }}>
            空间管理
          </div>
          <a
            className="active"
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ marginBottom: 8 }}>{space?.name || '空间'}</h1>
            {space?.description && (
              <p style={{ color: '#666' }}>{space.description}</p>
            )}
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            + 新建文档
          </button>
        </div>

        <div className="document-list">
          {documents.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: '#999' }}>
              暂无文档，点击右上角"新建文档"创建
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="document-item"
                onClick={() => navigate(`/documents/${doc.id}`)}
              >
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>📄 {doc.title}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    更新于 {dayjs(doc.updated_at || doc.created_at).format('YYYY-MM-DD HH:mm')}
                  </div>
                </div>
                <button
                  className="btn btn-danger"
                  style={{ padding: '4px 8px', fontSize: 12 }}
                  onClick={(e) => handleDeleteDoc(doc.id, e)}
                >
                  删除
                </button>
              </div>
            ))
          )}
        </div>

        {showCreateModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
          }}>
            <div className="card" style={{ width: 400 }}>
              <h3 style={{ marginBottom: 16 }}>新建文档</h3>
              <div className="form-group">
                <label>文档标题</label>
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="请输入文档标题"
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="btn btn-default" onClick={() => setShowCreateModal(false)}>
                  取消
                </button>
                <button className="btn btn-primary" onClick={handleCreateDoc} disabled={loading}>
                  {loading ? '创建中...' : '创建'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpaceDetail;
