import { useState, useEffect } from 'react';
import { listeningAPI } from '../services/api';

export default function Listening() {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [filters, setFilters] = useState({ level: '', year: '' });
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, [filters]);

  useEffect(() => {
    if (filters.level) {
      loadYears(filters.level);
    }
  }, [filters.level]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.level) params.level = filters.level;
      if (filters.year) params.year = filters.year;
      const response = await listeningAPI.getAll(params);
      setMaterials(response.data);
    } catch (err) {
      console.error('Failed to load materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadYears = async (level) => {
    try {
      const response = await listeningAPI.getYears(level);
      setAvailableYears(response.data);
    } catch (err) {
      console.error('Failed to load years:', err);
    }
  };

  const loadMaterialDetail = async (id) => {
    try {
      const response = await listeningAPI.getById(id);
      setSelectedMaterial(response.data);
      setShowTranscript(false);
      setShowQuestions(false);
      setShowAnswers(false);
    } catch (err) {
      console.error('Failed to load material:', err);
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">🎧 听力练习</h2>

      {selectedMaterial ? (
        <>
          <button 
            className="back-btn" 
            onClick={() => setSelectedMaterial(null)}
          >
            ← 返回列表
          </button>
          
          <h3 style={{ marginBottom: '20px', color: '#333' }}>{selectedMaterial.title}</h3>
          
          <div className="filter-bar" style={{ marginBottom: '20px' }}>
            <span>等级: {selectedMaterial.level.toUpperCase()}</span>
            <span>年份: {selectedMaterial.year}</span>
          </div>

          {selectedMaterial.audioURL ? (
            <audio controls style={{ width: '100%', marginBottom: '20px' }}>
              <source src={selectedMaterial.audioURL} type="audio/mpeg" />
              您的浏览器不支持音频播放。
            </audio>
          ) : (
            <div className="alert alert-info" style={{ marginBottom: '20px' }}>
              🎵 音频文件暂无（演示模式）
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <button 
              className="btn" 
              style={{ width: 'auto', marginRight: '10px' }}
              onClick={() => setShowTranscript(!showTranscript)}
            >
              {showTranscript ? '隐藏原文' : '查看原文'}
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ width: 'auto', marginRight: '10px' }}
              onClick={() => setShowQuestions(!showQuestions)}
            >
              {showQuestions ? '隐藏题目' : '查看题目'}
            </button>
            <button 
              className="btn btn-success" 
              style={{ width: 'auto' }}
              onClick={() => setShowAnswers(!showAnswers)}
            >
              {showAnswers ? '隐藏答案' : '查看答案'}
            </button>
          </div>

          {showTranscript && (
            <div className="transcript-box">
              <h4 style={{ marginBottom: '15px' }}>📝 听力原文</h4>
              {selectedMaterial.transcript}
            </div>
          )}

          {showQuestions && (
            <div className="transcript-box">
              <h4 style={{ marginBottom: '15px' }}>❓ 题目</h4>
              {selectedMaterial.questions || '暂无题目'}
            </div>
          )}

          {showAnswers && (
            <div className="transcript-box">
              <h4 style={{ marginBottom: '15px' }}>✅ 答案</h4>
              {selectedMaterial.answers || '暂无答案'}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="filter-bar">
            <select
              value={filters.level}
              onChange={(e) => {
                setFilters({ level: e.target.value, year: '' });
                setAvailableYears([]);
              }}
            >
              <option value="">全部等级</option>
              <option value="cet4">四级 (CET4)</option>
              <option value="cet6">六级 (CET6)</option>
            </select>

            {availableYears.length > 0 && (
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              >
                <option value="">全部年份</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
            )}
          </div>

          {loading ? (
            <p>加载中...</p>
          ) : materials.length === 0 ? (
            <p style={{ color: '#666' }}>暂无听力材料</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
              {materials.map((material) => (
                <div 
                  key={material.id} 
                  className="card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => loadMaterialDetail(material.id)}
                >
                  <h4>{material.title}</h4>
                  <p>等级: {material.level.toUpperCase()} | 年份: {material.year}</p>
                  <span style={{ color: '#667eea' }}>点击查看详情 →</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
