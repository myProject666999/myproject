import { useState, useEffect } from 'react';
import { wordAPI } from '../services/api';

export default function Vocabulary() {
  const [level, setLevel] = useState('cet4');
  const [currentWord, setCurrentWord] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    loadProgress();
    if (!showFavorites) {
      loadRandomWord();
    }
  }, [level]);

  useEffect(() => {
    if (showFavorites) {
      loadFavorites();
    }
  }, [showFavorites]);

  const loadProgress = async () => {
    try {
      const response = await wordAPI.getProgress();
      setProgress(response.data);
    } catch (err) {
      console.error('Failed to load progress:', err);
    }
  };

  const loadRandomWord = async () => {
    setLoading(true);
    try {
      const response = await wordAPI.getRandom(level);
      setCurrentWord(response.data);
    } catch (err) {
      console.error('Failed to load word:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await wordAPI.getFavorites();
      setFavorites(response.data);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  };

  const handleAction = async (action) => {
    if (!currentWord || !currentWord.word) return;

    try {
      await wordAPI.updateStatus(currentWord.word.id, action);
      if (action === 'favorite') {
        setCurrentWord({
          ...currentWord,
          is_favorited: !currentWord.is_favorited,
        });
      } else {
        loadRandomWord();
        loadProgress();
      }
    } catch (err) {
      console.error('Failed to update word status:', err);
    }
  };

  const levelProgress = progress?.[level];

  return (
    <div className="page-container">
      <h2 className="page-title">📖 背单词</h2>

      <div className="level-select">
        <button
          className={`level-btn ${level === 'cet4' && !showFavorites ? 'active' : ''}`}
          onClick={() => { setLevel('cet4'); setShowFavorites(false); }}
        >
          四级词汇
        </button>
        <button
          className={`level-btn ${level === 'cet6' && !showFavorites ? 'active' : ''}`}
          onClick={() => { setLevel('cet6'); setShowFavorites(false); }}
        >
          六级词汇
        </button>
        <button
          className={`level-btn ${showFavorites ? 'active' : ''}`}
          onClick={() => setShowFavorites(true)}
        >
          ⭐ 我的收藏
        </button>
      </div>

      {showFavorites ? (
        <div>
          {favorites.length === 0 ? (
            <p style={{ color: '#666' }}>暂无收藏的单词</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {favorites.map((word) => (
                <div key={word.id} className="word-detail">
                  <div className="word-en">{word.word} {word.pronunciation}</div>
                  <div className="word-cn">{word.meaning}</div>
                  {word.example && <div className="example">{word.example}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {levelProgress && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ marginBottom: '10px', color: '#666' }}>
                学习进度：{levelProgress.learned} / {levelProgress.total} ({levelProgress.percent?.toFixed(1) || 0}%)
              </p>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${levelProgress.percent || 0}%` }}></div>
              </div>
            </div>
          )}

          {loading ? (
            <p>加载中...</p>
          ) : currentWord?.message ? (
            <div className="word-card">
              <p className="word" style={{ fontSize: '1.5rem' }}>🎉 {currentWord.message}</p>
            </div>
          ) : currentWord?.word ? (
            <>
              <div className="word-card">
                <p className="word">{currentWord.word.word}</p>
                <p className="pronunciation">{currentWord.word.pronunciation}</p>
                <p className="meaning">{currentWord.word.meaning}</p>
                {currentWord.word.example && (
                  <div className="example">
                    <p>{currentWord.word.example}</p>
                    {currentWord.word.example_cn && <p>{currentWord.word.example_cn}</p>}
                  </div>
                )}
                <div style={{ marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <span style={{ opacity: 0.9 }}>
                    {currentWord.is_favorited ? '⭐ 已收藏' : '☆ 未收藏'}
                  </span>
                  <span style={{ opacity: 0.9 }}>
                    正确: {currentWord.correct_count || 0} | 错误: {currentWord.wrong_count || 0}
                  </span>
                </div>
              </div>

              <div className="word-actions">
                <button
                  className={`btn favorite-btn`}
                  onClick={() => handleAction('favorite')}
                >
                  {currentWord.is_favorited ? '取消收藏' : '⭐ 收藏'}
                </button>
                <button
                  className="btn know-btn"
                  onClick={() => handleAction('know')}
                >
                  ✓ 认识
                </button>
                <button
                  className="btn dont-know-btn"
                  onClick={() => handleAction('dont_know')}
                >
                  ✗ 不认识
                </button>
                <button
                  className="btn"
                  onClick={loadRandomWord}
                >
                  下一个
                </button>
              </div>
            </>
          ) : (
            <p>暂无单词</p>
          )}
        </>
      )}
    </div>
  );
}
