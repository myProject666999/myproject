import React, { useState, useEffect } from 'react';
import { categoryApi } from '../../api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');

  const loadCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data);
    } catch (err) {
      console.error('加载分类失败:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setName(category.name);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, { name });
        alert('分类更新成功！');
      } else {
        await categoryApi.create({ name });
        alert('分类创建成功！');
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.error || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个分类吗？')) return;
    try {
      await categoryApi.delete(id);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.error || '删除失败');
    }
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
        <h2>分类管理</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={openCreateModal}
        >
          + 添加分类
        </button>
      </div>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>分类名称</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>
                  <div className="actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEditModal(category)}
                    >
                      编辑
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(category.id)}
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
            <h3>{editingCategory ? '编辑分类' : '添加分类'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>分类名称</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="请输入分类名称"
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
                  {editingCategory ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
