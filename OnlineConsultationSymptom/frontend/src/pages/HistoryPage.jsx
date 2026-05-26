import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyApi } from '../utils/api.js';

function HistoryPage() {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadHistory();
  }, [page]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await historyApi.getAll({ page, pageSize: 10 });
      setHistoryList(data.list);
      setTotal(data.total);
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, event) => {
    event.stopPropagation();
    if (!confirm('确定要删除这条记录吗？')) return;
    
    try {
      await historyApi.delete(id);
      loadHistory();
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  const getTypeText = (type) => {
    return type === 'qa' ? '问答式' : '症状选择';
  };

  const totalPages = Math.ceil(total / 10);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div>
      <div className="card">
        <h2 className="card-title">📋 自查历史</h2>
        
        {historyList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>暂无自查记录</p>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: 20 }}
              onClick={() => navigate('/')}
            >
              开始自查
            </button>
          </div>
        ) : (
          <div className="history-list">
            {historyList.map(item => (
              <div 
                key={item.id} 
                className="history-item"
                onClick={() => navigate('/result', { 
                  state: { 
                    result: {
                      diseases: item.result_diseases,
                      advice: item.advice_given
                    },
                    type: item.consultation_type,
                    selectedSymptoms: item.symptoms_selected,
                    questionHistory: item.question_answers
                  } 
                })}
              >
                <div className="history-header">
                  <span className="history-type">{getTypeText(item.consultation_type)}</span>
                  <span className="history-date">{formatDate(item.created_at)}</span>
                </div>
                {item.symptoms_selected && item.symptoms_selected.length > 0 && (
                  <div className="history-symptoms">
                    选择症状: {item.symptoms_selected.map(s => `#${s}`).join(', ')}
                  </div>
                )}
                {item.result_diseases && item.result_diseases.length > 0 && (
                  <div className="history-result">
                    可能疾病: {item.result_diseases.slice(0, 3).map(d => d.name).join('、')}
                    {item.result_diseases.length > 3 && ` 等${item.result_diseases.length}种`}
                  </div>
                )}
                <div style={{ marginTop: 10, textAlign: 'right' }}>
                  <button 
                    className="btn btn-danger"
                    onClick={(e) => handleDelete(item.id, e)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              上一页
            </button>
            <span style={{ alignSelf: 'center' }}>{page} / {totalPages}</span>
            <button 
              className="btn btn-secondary"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              下一页
            </button>
          </div>
        )}
      </div>

      <div className="disclaimer">
        <strong>⚠️ 免责声明：</strong>历史记录仅供参考，不能替代专业医疗诊断。
      </div>
    </div>
  );
}

export default HistoryPage;
