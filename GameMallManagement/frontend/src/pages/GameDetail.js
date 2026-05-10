import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { gameApi, cartApi } from '../api';
import { useAuth } from '../context/AuthContext';

const GameDetail = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadGame = async () => {
      try {
        const res = await gameApi.getById(id);
        setGame(res.data);
      } catch (err) {
        console.error('加载游戏详情失败:', err);
      }
      setLoading(false);
    };
    loadGame();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await cartApi.add({ game_id: parseInt(id) });
      alert('已添加到购物车！');
    } catch (err) {
      alert(err.response?.data?.error || '添加失败');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>加载中...</h3>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>游戏不存在</h3>
          <Link to="/" className="back-btn">
            返回游戏列表
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    if (price === 0) return '免费';
    return `¥${price.toFixed(2)}`;
  };

  return (
    <div className="container">
      <Link to="/" className="back-btn">
        ← 返回游戏列表
      </Link>
      <div className="game-detail">
        <div className="game-detail-header">
          <img
            src={game.image || 'https://via.placeholder.com/300x200'}
            alt={game.name}
          />
          <div className="game-detail-info">
            <h2>{game.name}</h2>
            {game.category && (
              <span className="category">{game.category.name}</span>
            )}
            <p className="description">{game.description}</p>
            <div className={`price ${game.price === 0 ? 'free' : ''}`}>
              {formatPrice(game.price)}
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '200px' }}
              onClick={handleAddToCart}
            >
              加入购物车
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
