import React, { useState, useEffect } from 'react'
import api from '../../utils/api'
import Table from '../../components/Table'
import Modal from '../../components/Modal'

const Menus = () => {
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingMenu, setEditingMenu] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    path: '',
    icon: '',
    parent_id: '',
    sort: 0,
  })

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    setLoading(true)
    try {
      const response = await api.get('/menus/all')
      setMenus(response.data)
    } catch (error) {
      console.error('Failed to fetch menus:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingMenu(null)
    setFormData({
      name: '',
      path: '',
      icon: '',
      parent_id: '',
      sort: 0,
    })
    setShowModal(true)
  }

  const openEditModal = (menu) => {
    setEditingMenu(menu)
    setFormData({
      name: menu.name,
      path: menu.path || '',
      icon: menu.icon || '',
      parent_id: menu.parent_id || '',
      sort: menu.sort || 0,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        sort: parseInt(formData.sort) || 0,
      }
      if (editingMenu) {
        await api.put(`/menus/${editingMenu.id}`, data)
      } else {
        await api.post('/menus', data)
      }
      setShowModal(false)
      fetchMenus()
    } catch (error) {
      console.error('Failed to save menu:', error)
      alert(error.response?.data?.error || '保存失败')
    }
  }

  const handleDelete = async (menu) => {
    if (confirm(`确定要删除菜单「${menu.name}」吗？`)) {
      try {
        await api.delete(`/menus/${menu.id}`)
        fetchMenus()
      } catch (error) {
        console.error('Failed to delete menu:', error)
        alert(error.response?.data?.error || '删除失败')
      }
    }
  }

  const parentMenus = menus.filter((m) => !m.parent_id)

  const columns = [
    { key: 'name', title: '菜单名称' },
    { key: 'path', title: '路由路径' },
    { key: 'icon', title: '图标' },
    { key: 'sort', title: '排序', align: 'center' },
    {
      key: 'parent',
      title: '父菜单',
      render: (_, row) => {
        const parent = menus.find((m) => m.id === row.parent_id)
        return parent?.name || '-'
      },
    },
    {
      key: 'actions',
      title: '操作',
      width: '150px',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => openEditModal(row)} className="text-blue-600 hover:text-blue-800">
            编辑
          </button>
          <button onClick={() => handleDelete(row)} className="text-red-600 hover:text-red-800">
            删除
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">菜单管理</h2>
          <button onClick={openCreateModal} className="btn btn-primary">
            + 新增菜单
          </button>
        </div>
        <Table columns={columns} data={menus} loading={loading} />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingMenu ? '编辑菜单' : '新增菜单'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">菜单名称 *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">路由路径</label>
            <input
              type="text"
              className="input"
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
              placeholder="/example"
            />
          </div>
          <div>
            <label className="label">图标</label>
            <input
              type="text"
              className="input"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="dashboard"
            />
          </div>
          <div>
            <label className="label">父菜单</label>
            <select
              className="input"
              value={formData.parent_id}
              onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
            >
              <option value="">无（顶级菜单）</option>
              {parentMenus.map((m) => (
                <option
                  key={m.id}
                  value={m.id}
                  disabled={editingMenu && m.id === editingMenu.id}
                >
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">排序</label>
            <input
              type="number"
              className="input"
              value={formData.sort}
              onChange={(e) => setFormData({ ...formData, sort: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              保存
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Menus
