import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { symptomApi, consultationApi } from '../utils/api.js';

function SymptomCheckPage() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadSymptoms();
  }, []);

  const loadSymptoms = async () => {
    try {
      const data = await symptomApi.getAll();
      setSymptoms(data);
    } catch (error) {
      console.error('加载症状列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms(prev => {
      if (prev.includes(symptomId)) {
        return prev.filter(id => id !== symptomId);
      }
      return [...prev, symptomId];
    });
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) {
      alert('请至少选择一个症状');
      return;
    }

    setAnalyzing(true);
    try {
      const result = await consultationApi.analyze(selectedSymptoms);
      navigate('/result', { 
        state: { 
          result, 
          type: 'symptom',
          selectedSymptoms 
        } 
      });
    } catch (error) {
      alert('分析失败，请重试');
      console.error('症状分析失败:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div>
      <div className="card">
        <h2 className="card-title">🔍 选择您的症状</h2>
        <p style={{ color: '#666', marginBottom: 20 }}>请选择您目前出现的症状，可多选</p>
        
        <div className="symptom-categories">
          {symptoms.map(category => (
            <div key={category.category} className="symptom-category">
              <h3>{category.category}</h3>
              <div className="symptom-list">
                {category.symptoms.map(symptom => (
                  <div
                    key={symptom.id}
                    className={`symptom-item ${selectedSymptoms.includes(symptom.id) ? 'selected' : ''}`}
                    onClick={() => toggleSymptom(symptom.id)}
                  >
                    <span className="symptom-icon">{symptom.icon}</span>
                    <span>{symptom.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="selected-symptoms-bar">
        <div>
          已选择 <span className="selected-count">{selectedSymptoms.length}</span> 个症状
        </div>
        <div className="btn-group" style={{ marginTop: 0 }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setSelectedSymptoms([])}
            disabled={selectedSymptoms.length === 0}
          >
            清空选择
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleAnalyze}
            disabled={selectedSymptoms.length === 0 || analyzing}
          >
            {analyzing ? '分析中...' : '开始分析'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SymptomCheckPage;
