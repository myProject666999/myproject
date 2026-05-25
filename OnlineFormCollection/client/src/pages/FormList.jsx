import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formApi } from '../api/index.js';

export default function FormList() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const res = await formApi.list();
      setForms(res.data);
    } catch (err) {
      console.error('加载表单失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    try {
      await formApi.delete(showDeleteModal);
      setForms(forms.filter(f => f.id !== showDeleteModal));
      setShowDeleteModal(null);
    } catch (err) {
      alert('删除失败: ' + (err.response?.data?.error || err.message));
    }
  };

  const getStatusText = (status) => {
    return status === 'published' ? '已发布' : '草稿';
  };

  const getStatusClass = (status) => {
    return status === 'published' ? 'status-badge status-published' : 'status-badge status-draft';
  };

  if (loading) {
    return <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-text">加载中...</div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">表单管理</h1>
        <Link to="/forms/new" className="btn btn-primary">+ 新建表单</Link>
      </div>

      {forms.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-text">暂无表单，点击右上角创建第一个表单</div>
        </div>
      ) : (
        <div className="form-list">
          {forms.map(form => (
            <div key={form.id} className="form-card" onClick={() => navigate(`/forms/${form.id}/edit`)}>
              <div className="form-card-title">{form.title}</div>
              <div className="form-card-desc">{form.description || '暂无描述'}</div>
              <div className="form-card-meta">
                <span className={getStatusClass(form.status)}>{getStatusText(form.status)}</span>
                <span>{form.submission_count || 0} 条提交</span>
                <span>{new Date(form.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                {form.status === 'published' && (
                  <button
                    className="btn btn-sm btn-default"
                    onClick={(e) => { e.stopPropagation(); navigate(`/forms/${form.id}/fill`); }}
                  >
                    填写
                  </button>
                )}
                <button
                  className="btn btn-sm btn-default"
                  onClick={(e) => { e.stopPropagation(); navigate(`/forms/${form.id}/data`); }}
                >
                  数据
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={(e) => { e.stopPropagation(); setShowDeleteModal(form.id); }}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">确认删除</div>
            <div className="modal-content">确定要删除此表单吗？所有提交数据也将被删除，此操作不可恢复。</div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowDeleteModal(null)}>取消</button>
              <button className="btn btn-danger" onClick={handleDelete}>确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
