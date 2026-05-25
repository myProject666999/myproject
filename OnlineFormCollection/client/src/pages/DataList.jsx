import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formApi, submissionApi, exportApi } from '../api/index.js';

export default function DataList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  useEffect(() => {
    loadForm();
    loadSubmissions();
  }, [id, page]);

  const loadForm = async () => {
    try {
      const res = await formApi.get(id);
      setForm(res.data);
    } catch (err) {
      console.error('加载表单失败:', err);
    }
  };

  const loadSubmissions = async () => {
    try {
      const res = await submissionApi.list(id, { page, pageSize });
      setSubmissions(res.data.list);
      setTotal(res.data.total);
    } catch (err) {
      console.error('加载数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    try {
      await submissionApi.delete(showDeleteModal);
      setShowDeleteModal(null);
      loadSubmissions();
    } catch (err) {
      alert('删除失败: ' + (err.response?.data?.error || err.message));
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  if (loading) {
    return <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-text">加载中...</div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{form?.title || '数据列表'}</h1>
          <div style={{ color: '#909399', fontSize: '13px', marginTop: '4px' }}>
            共 {total} 条提交记录
          </div>
        </div>
        <div className="toolbar">
          <button className="btn btn-default" onClick={() => navigate('/forms')}>返回</button>
          <button className="btn btn-default" onClick={() => exportApi.csv(id)}>📊 导出 CSV</button>
          <button className="btn btn-primary" onClick={() => exportApi.excel(id)}>📈 导出 Excel</button>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-text">暂无提交数据</div>
          {form?.status === 'published' && (
            <Link to={`/forms/${id}/fill`} className="btn btn-primary" style={{ marginTop: '16px' }}>
              去填写表单
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>提交时间</th>
                  {form?.fields?.map(field => (
                    <th key={field.id}>{field.label}</th>
                  ))}
                  <th style={{ width: '80px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, index) => (
                  <tr key={sub.id}>
                    <td>{(page - 1) * pageSize + index + 1}</td>
                    <td>{new Date(sub.submitted_at).toLocaleString()}</td>
                    {form?.fields?.map(field => (
                      <td key={field.id}>
                        {Array.isArray(sub.data[`field_${field.id}`])
                          ? sub.data[`field_${field.id}`].join(', ')
                          : sub.data[`field_${field.id}`] || '-'}
                      </td>
                    ))}
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setShowDeleteModal(sub.id)}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                上一页
              </button>
              <span className="pagination-info">
                第 {page} / {totalPages} 页
              </span>
              <button
                className="pagination-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}

      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">确认删除</div>
            <div className="modal-content">确定要删除这条提交记录吗？此操作不可恢复。</div>
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
