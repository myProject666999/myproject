import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, type, selectedSymptoms, questionHistory } = location.state || {};

  if (!result) {
    return (
      <div className="card">
        <p>暂无结果数据</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>返回首页</button>
      </div>
    );
  }

  const diseases = result.diseases || [];
  const advice = result.advice || result.result?.advice || '';

  return (
    <div className="result-container">
      <div className="result-header">
        <h2>📊 诊断结果</h2>
        <p>以下分析结果仅供参考，不能替代专业医疗诊断</p>
      </div>

      {selectedSymptoms && selectedSymptoms.length > 0 && (
        <div className="card">
          <h3 className="card-title">您选择的症状</h3>
          <div className="symptom-list">
            {/* 显示选择的症状ID，实际应用中应查询症状名称 */}
            {selectedSymptoms.map((id, index) => (
              <span key={id} className="symptom-item selected" style={{ cursor: 'default' }}>
                症状 #{id}
              </span>
            ))}
          </div>
        </div>
      )}

      {questionHistory && questionHistory.length > 0 && (
        <div className="card">
          <h3 className="card-title">问答记录</h3>
          {questionHistory.map((item, index) => (
            <div key={index} style={{ 
              padding: '12px 0', 
              borderBottom: index < questionHistory.length - 1 ? '1px solid #eee' : 'none'
            }}>
              <p style={{ fontWeight: 500, marginBottom: 4 }}>Q: {item.questionText}</p>
              <p style={{ color: '#667eea' }}>A: {item.answer}</p>
            </div>
          ))}
        </div>
      )}

      {diseases.length > 0 && (
        <div className="card">
          <h3 className="card-title">🩺 可能的疾病</h3>
          <div className="disease-list">
            {diseases.map((disease, index) => (
              <div 
                key={disease.id} 
                className={`disease-card severity-${disease.severity}`}
              >
                <div className="disease-header">
                  <span className="disease-name">{disease.name}</span>
                  {disease.probability && (
                    <span className="disease-probability">
                      匹配度 {disease.probability}%
                    </span>
                  )}
                </div>
                <span className={`disease-severity severity-${
                  disease.severity === 1 ? 'mild' : 
                  disease.severity === 2 ? 'moderate' : 'severe'
                }`}>
                  {disease.severity_text}
                </span>
                <div className="disease-info">
                  <p><strong>疾病简介：</strong>{disease.description}</p>
                  <p><strong>常见症状：</strong>{disease.symptoms_summary}</p>
                  <p><strong>建议科室：</strong>{disease.department}</p>
                  <p><strong>就医建议：</strong>{disease.medical_advice}</p>
                  {disease.treatment_suggestion && (
                    <p><strong>常规建议：</strong>{disease.treatment_suggestion}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {advice && (
        <div className="card">
          <h3 className="card-title">💡 综合建议</h3>
          <div className="advice-section">
            <p style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>{advice}</p>
          </div>
        </div>
      )}

      <div className="disclaimer">
        <strong>⚠️ 重要提示：</strong>本系统提供的诊断结果仅供参考，不能替代专业医疗诊断、治疗或医生的专业意见。如有身体不适，请及时到正规医疗机构就诊。
      </div>

      <div className="btn-group">
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          返回首页
        </button>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate(type === 'qa' ? '/qa' : '/symptom-check')}
        >
          重新自查
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/articles')}
        >
          查看相关文章
        </button>
      </div>
    </div>
  );
}

export default ResultPage;
