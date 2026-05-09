import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dailySentenceAPI, announcementAPI } from '../services/api';

export default function Home() {
  const [dailySentence, setDailySentence] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bingImage, setBingImage] = useState('');

  useEffect(() => {
    loadData();
    loadBingImage();
  }, []);

  const loadData = async () => {
    try {
      const [sentenceRes, announcementsRes] = await Promise.all([
        dailySentenceAPI.getRandom(),
        announcementAPI.getLatest(),
      ]);
      setDailySentence(sentenceRes.data);
      setAnnouncements(announcementsRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBingImage = async () => {
    try {
      const today = new Date();
      const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
      setBingImage(`https://bing.com/th?id=OHR.LondonSunrise_${dateStr}_1920x1080.jpg`);
    } catch (err) {
      console.error('Failed to load Bing image:', err);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="page-title">📚 英语学习管理系统</h2>

      {dailySentence && (
        <div 
          className="daily-sentence"
          style={{
            backgroundImage: bingImage ? `linear-gradient(rgba(102, 126, 234, 0.85), rgba(118, 75, 162, 0.85)), url(${bingImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <h3>🌟 每日一句</h3>
          <p className="sentence">{dailySentence.sentence}</p>
          <p className="translation">{dailySentence.translation}</p>
        </div>
      )}

      <div className="grid-3" style={{ marginBottom: '30px' }}>
        <Link to="/vocabulary" style={{ textDecoration: 'none' }}>
          <div className="card">
            <h4>📖 背单词</h4>
            <p>根据等级学习英语单词，支持收藏、认识/不认识标记</p>
            <div className="progress-bar">
              <div className="progress" style={{ width: '0%' }}></div>
            </div>
          </div>
        </Link>
        <Link to="/listening" style={{ textDecoration: 'none' }}>
          <div className="card">
            <h4>🎧 听力练习</h4>
            <p>历年真题听力训练，提升听力理解能力</p>
          </div>
        </Link>
        <Link to="/reading" style={{ textDecoration: 'none' }}>
          <div className="card">
            <h4>📚 阅读书籍</h4>
            <p>精选英文书籍，提升阅读水平</p>
          </div>
        </Link>
      </div>

      <h3 style={{ marginBottom: '20px', color: '#333' }}>📢 最新公告</h3>
      <div className="announcement-list">
        {announcements.length === 0 ? (
          <p style={{ color: '#666' }}>暂无公告</p>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="announcement-item">
              <div className="announcement-title">{announcement.title}</div>
              <div className="announcement-date">
                发布时间: {new Date(announcement.created_at).toLocaleString()}
              </div>
              <p style={{ marginTop: '10px', color: '#666', fontSize: '0.95rem' }}>
                {announcement.content.substring(0, 100)}{announcement.content.length > 100 ? '...' : ''}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
