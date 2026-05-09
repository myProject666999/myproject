import { useState, useEffect } from 'react';
import { bookAPI } from '../services/api';

export default function Reading() {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [levelFilter, setLevelFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBooks();
  }, [levelFilter]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const response = await bookAPI.getAll(levelFilter);
      setBooks(response.data);
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBookDetail = async (id) => {
    try {
      const response = await bookAPI.getById(id);
      setSelectedBook(response.data.book);
      setCurrentPage(response.data.current_page || 0);
    } catch (err) {
      console.error('Failed to load book:', err);
    }
  };

  const updateProgress = async (page) => {
    if (!selectedBook) return;
    try {
      await bookAPI.updateProgress(selectedBook.id, page);
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const getLevelLabel = (level) => {
    const labels = {
      beginner: '入门',
      intermediate: '中级',
      advanced: '高级',
    };
    return labels[level] || level;
  };

  const getLevelColor = (level) => {
    const colors = {
      beginner: '#28a745',
      intermediate: '#ffc107',
      advanced: '#dc3545',
    };
    return colors[level] || '#6c757d';
  };

  return (
    <div className="page-container">
      <h2 className="page-title">📚 阅读书籍</h2>

      {selectedBook ? (
        <>
          <button 
            className="back-btn" 
            onClick={() => setSelectedBook(null)}
          >
            ← 返回书架
          </button>
          
          <h3 style={{ marginBottom: '10px', color: '#333' }}>{selectedBook.title}</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            作者: {selectedBook.author} | 
            难度: <span style={{ color: getLevelColor(selectedBook.level) }}>{getLevelLabel(selectedBook.level)}</span>
          </p>

          {selectedBook.description && (
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '10px' }}>📖 简介</h4>
              <p>{selectedBook.description}</p>
            </div>
          )}

          <div className="book-content">
            {selectedBook.content}
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              className="btn btn-secondary"
              style={{ width: 'auto' }}
              disabled={currentPage <= 0}
              onClick={() => {
                const newPage = Math.max(0, currentPage - 1);
                setCurrentPage(newPage);
                updateProgress(newPage);
              }}
            >
              ← 上一页
            </button>
            <span style={{ color: '#666' }}>当前位置: {currentPage > 0 ? `${currentPage}%` : '开始'}</span>
            <button 
              className="btn"
              style={{ width: 'auto' }}
              onClick={() => {
                const newPage = Math.min(100, currentPage + 10);
                setCurrentPage(newPage);
                updateProgress(newPage);
              }}
            >
              下一页 →
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="filter-bar">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <option value="">全部难度</option>
              <option value="beginner">入门</option>
              <option value="intermediate">中级</option>
              <option value="advanced">高级</option>
            </select>
          </div>

          {loading ? (
            <p>加载中...</p>
          ) : books.length === 0 ? (
            <p style={{ color: '#666' }}>暂无书籍</p>
          ) : (
            <div className="book-list">
              {books.map((book) => (
                <div 
                  key={book.id} 
                  className="book-card"
                  onClick={() => loadBookDetail(book.id)}
                >
                  <div className="book-cover">
                    📖
                  </div>
                  <div className="book-info">
                    <div className="book-title">{book.title}</div>
                    <div className="book-author">
                      {book.author} • 
                      <span style={{ color: getLevelColor(book.level) }}>
                        {' '}{getLevelLabel(book.level)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
