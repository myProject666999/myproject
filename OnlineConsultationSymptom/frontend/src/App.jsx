import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import SymptomCheckPage from './pages/SymptomCheckPage.jsx';
import QAPage from './pages/QAPage.jsx';
import ResultPage from './pages/ResultPage.jsx';
import ArticleListPage from './pages/ArticleListPage.jsx';
import ArticleDetailPage from './pages/ArticleDetailPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';

function App() {
  const navigate = useNavigate();
  const [disclaimer, setDisclaimer] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  useEffect(() => {
    const accepted = localStorage.getItem('disclaimerAccepted');
    if (accepted) {
      setShowDisclaimer(false);
    }
  }, []);

  const acceptDisclaimer = () => {
    localStorage.setItem('disclaimerAccepted', 'true');
    setShowDisclaimer(false);
  };

  return (
    <div className="app">
      <div className="header">
        <h1>🏥 在线问诊 - 症状自查系统</h1>
        <p>健康科普平台，提供症状自查与就医建议</p>
      </div>

      <nav className="nav">
        <NavLink to="/" className="nav-link" end>首页</NavLink>
        <NavLink to="/articles" className="nav-link">健康文章</NavLink>
        <NavLink to="/history" className="nav-link">自查历史</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/symptom-check" element={<SymptomCheckPage />} />
        <Route path="/qa" element={<QAPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/articles" element={<ArticleListPage />} />
        <Route path="/articles/:id" element={<ArticleDetailPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>

      {showDisclaimer && (
        <div className="disclaimer" style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          right: 20,
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          <strong style={{ color: '#e74c3c', display: 'block', marginBottom: 8 }}>免责声明</strong>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
            本系统提供的所有诊断结果和建议仅供参考，不能替代专业医疗诊断、治疗或医生的专业意见。如有身体不适，请及时到正规医疗机构就诊。
          </p>
          <button className="btn btn-primary" onClick={acceptDisclaimer}>我已了解</button>
        </div>
      )}
    </div>
  );
}

export default App;
