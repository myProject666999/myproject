import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartApi } from '../api';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await cartApi.getAll();
      setItems(res.data);
    } catch (err) {
      console.error('加载购物车失败:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadCart();
  }, [user, navigate]);

  const handleUpdateQuantity = async (id, quantity) => {
    if (quantity < 1) return;
    try {
      await cartApi.update(id, { quantity });
      loadCart();
    } catch (err) {
      alert(err.response?.data?.error || '更新失败');
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('确定要删除这个商品吗？')) return;
    try {
      await cartApi.remove(id);
      loadCart();
    } catch (err) {
      alert(err.response?.data?.error || '删除失败');
    }
  };

  const handleCheckout = async () => {
    try {
      await cartApi.checkout();
      setMessage('订单创建成功！');
      setTimeout(() => navigate('/orders'), 1500);
    } catch (err) {
      alert(err.response?.data?.error || '结账失败');
    }
  };

  const totalPrice = items.reduce(
    (sum, item) => sum + item.game.price * item.quantity,
    0
  );

  const formatPrice = (price) => {
    if (price === 0) return '免费';
    return `¥${price.toFixed(2)}`;
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

  return (
    <div className="container cart-page">
      <h2 className="page-title">购物车</h2>
      {message && <div className="message success">{message}</div>}

      {items.length === 0 ? (
        <div className="empty-state">
          <h3>购物车是空的</h3>
          <p>
            去<Link to="/">游戏商店</Link>看看吧
          </p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.game.image || 'https://via.placeholder.com/120x80'}
                  alt={item.game.name}
                />
                <div className="cart-item-info">
                  <h3>{item.game.name}</h3>
                  <p className="price">{formatPrice(item.game.price)}</p>
                </div>
                <div className="cart-item-quantity">
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item.id, item.quantity - 1)
                    }
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item.id, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>
                <div style={{ minWidth: '100px', textAlign: 'right' }}>
                  <strong>{formatPrice(item.game.price * item.quantity)}</strong>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemove(item.id)}
                >
                  删除
                </button>
              </div>
            ))}
          </div>

          <div className="cart-total">
            <h3>
              <span>总计:</span>
              <span className="total-price">{formatPrice(totalPrice)}</span>
            </h3>
            <button className="btn btn-primary" onClick={handleCheckout}>
              结账
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
