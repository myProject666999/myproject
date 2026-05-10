import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameApi, categoryApi, cartApi } from '../api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadGames = async () => {
    setLoading(true);
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      if (selectedCategory) params.category_id = selectedCategory;
      const res = await gameApi.getAll(params);
      setGames(res.data);
    } catch (err) {
      console.error('加载游戏失败:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        setCategories(res.data);
      } catch (err) {
        console.error('加载分类失败:', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadGames();
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword, selectedCategory]);

  const handleGameClick = (id) => {
    navigate(`/games/${id}`);
  };

  const handleAddToCart = async (e, gameId) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await cartApi.add({ game_id: gameId });
      alert('已添加到购物车！');
    } catch (err) {
      alert(err.response?.data?.error || '添加失败');
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return '免费';
    return `¥${price.toFixed(2)}`;
  };

  return (
    <div className="container home-page">
      <div className="welcome-banner">
        <h2>🎮 欢迎来到游戏商城</h2>
        <p>精选优质游戏，享受精彩游戏世界</p>
      </div>

      <div className="filter-section">
        <div className="filter-row">
          <input
            type="text"
            placeholder="搜索游戏名称或描述..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ flex: 1, minWidth: '250px' }}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">全部分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <h3>加载中...</h3>
        </div>
      ) : games.length === 0 ? (
        <div className="empty-state">
          <h3>没有找到游戏</h3>
          <p>尝试其他搜索词或分类</p>
        </div>
      ) : (
        <div className="games-grid">
          {games.map((game) => (
            <div
              key={game.id}
              className="game-card"
              onClick={() => handleGameClick(game.id)}
            >
              <img
                src={game.image || 'https://via.placeholder.com/300x200'}
                alt={game.name}
              />
              <div className="game-card-content">
                <h3>{game.name}</h3>
                {game.category && (
                  <span className="category">{game.category.name}</span>
                )}
                <p className="description">{game.description}</p>
                <div
                  className={`price ${game.price === 0 ? 'free' : ''}`}
                  style={{ marginBottom: '15px' }}
                >
                  {formatPrice(game.price)}
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={(e) => handleAddToCart(e, game.id)}
                >
                  加入购物车
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
