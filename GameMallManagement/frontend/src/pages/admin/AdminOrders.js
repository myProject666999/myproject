import React, { useState, useEffect } from 'react';
import { orderApi } from '../../api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const res = await orderApi.getAll();
      setOrders(res.data);
    } catch (err) {
      console.error('加载订单失败:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await orderApi.updateStatus(id, status);
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.error || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个订单吗？')) return;
    try {
      await orderApi.delete(id);
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.error || '删除失败');
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return '待发货';
      case 'shipped':
        return '已发货';
      case 'completed':
        return '已完成';
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'shipped':
        return 'status-shipped';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-pending';
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return '免费';
    return `¥${price.toFixed(2)}`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="empty-state">
        <h3>加载中...</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-header">
        <h2>订单管理</h2>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>暂无订单</h3>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>
                    订单 #{order.id} - {order.user?.username || '未知用户'}
                  </h3>
                  <span style={{ color: '#999', fontSize: '14px' }}>
                    {formatDate(order.created_at)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    className={`order-status ${getStatusClass(order.status)}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                  {order.status === 'pending' && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleUpdateStatus(order.id, 'shipped')}
                    >
                      发货
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleUpdateStatus(order.id, 'completed')}
                    >
                      完成
                    </button>
                  )}
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(order.id)}
                  >
                    删除
                  </button>
                </div>
              </div>

              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item.id} className="order-item">
                    <img
                      src={
                        item.game.image ||
                        'https://via.placeholder.com/80x50'
                      }
                      alt={item.game.name}
                    />
                    <div className="order-item-info">
                      <h4>{item.game.name}</h4>
                      <span style={{ color: '#666' }}>
                        {formatPrice(item.price)} × {item.quantity}
                      </span>
                    </div>
                    <div className="subtotal">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <span>共 {order.items.length} 件商品</span>
                <div className="order-total">
                  总计: {formatPrice(order.total_price)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
