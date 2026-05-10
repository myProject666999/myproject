import React, { useState, useEffect } from 'react';
import { gameApi, categoryApi } from '../../api';

const AdminGames = () => {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category_id: '',
  });

  const loadGames = async () => {
    try {
      const res = await gameApi.getAll();
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
    loadGames();
  }, []);

  const openCreateModal = () => {
    setEditingGame(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category_id: categories[0]?.id || '',
    });
    setShowModal(true);
  };

  const openEditModal = (game) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      description: game.description,
      price: game.price,
      image: game.image || '',
      category_id: game.category_id || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id),
      };
      if (editingGame) {
        await gameApi.update(editingGame.id, data);
        alert('游戏更新成功！');
      } else {
        await gameApi.create(data);
        alert('游戏创建成功！');
      }
      setShowModal(false);
      loadGames();
    } catch (err) {
      alert(err.response?.data?.error || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个游戏吗？')) return;
    try {
      await gameApi.delete(id);
      loadGames();
    } catch (err) {
      alert(err.response?.data?.error || '删除失败');
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return '免费';
    return `¥${price.toFixed(2)}`;
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
        <h2>游戏管理</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={openCreateModal}
        >
          + 添加游戏
        </button>
      </div>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>图片</th>
              <th>名称</th>
              <th>分类</th>
              <th>价格</th>
              <th>描述</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.id}>
                <td>
                  <img
                    src={game.image || 'https://via.placeholder.com/60x40'}
                    alt={game.name}
                    style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                </td>
                <td>{game.name}</td>
                <td>{game.category?.name || '-'}</td>
                <td>{formatPrice(game.price)}</td>
                <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {game.description}
                </td>
                <td>
                  <div className="actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEditModal(game)}
                    >
                      编辑
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(game.id)}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingGame ? '编辑游戏' : '添加游戏'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>游戏名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>游戏描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>价格 (¥)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>分类</label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>图片URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowModal(false)}
                >
                  取消
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingGame ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGames;
