import React, { useState, useEffect } from 'react'
import api from '../../utils/api'
import Table from '../../components/Table'
import Modal from '../../components/Modal'

const Permissions = () => {
  const [permissions, setPermissions] = useState([])
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingPermission, setEditingPermission] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    menu_id: '',
  })

  useEffect(() => {
    fetchPermissions()
    fetchMenus()
  }, [])

  const fetchPermissions = async () => {
    setLoading(true)
    try {
      const response = await api.get('/permissions')
      setPermissions(response.data)
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMenus = async () => {
    try {
      const response = await api.get('/menus/all')
      setMenus(response.data)
    } catch (error) {
      console.error('Failed to fetch menus:', error)
    }
  }

  const openCreateModal = () => {
    setEditingPermission(null)
    setFormData({
      name: '',
      code: '',
      description: '',
      menu_id: '',
    })
    setShowModal(true)
  }

  const openEditModal = (permission) => {
    setEditingPermission(permission)
    setFormData({
      name: permission.name,
      code: permission.code,
      description: permission.description || '',
      menu_id: permission.menu_id || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        menu_id: formData.menu_id ? parseInt(formData.menu_id) : null,
      }
      if (editingPermission) {
        await api.put(`/permissions/${editingPermission.id}`, data)
      } else {
        await api.post('/permissions', data)
      }
      setShowModal(false)
      fetchPermissions()
    } catch (error) {
      console.error('Failed to save permission:', error)
      alert(error.response?.data?.error || '保存失败')
    }
  }

  const handleDelete = async (permission) => {
    if (confirm(`确定要删除权限「${permission.name}」吗？`)) {
      try {
        await api.delete(`/permissions/${permission.id}`)
        fetchPermissions()
      } catch (error) {
        console.error('Failed to delete permission:', error)
        alert(error.response?.data?.error || '删除失败')
      }
    }
  }

  const columns = [
    { key: 'name', title: '权限名称' },
    { key: 'code', title: '权限代码' },
    { key: 'description', title: '描述' },
    {
      key: 'menu',
      title: '关联菜单',
      render: (_, row) => {
        const menu = menus.find((m) => m.id === row.menu_id)
        return menu?.name || '-'
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
          <h2 className="text-xl font-semibold text-gray-800">权限管理</h2>
          <button onClick={openCreateModal} className="btn btn-primary">
            + 新增权限
          </button>
        </div>
        <Table columns={columns} data={permissions} loading={loading} />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPermission ? '编辑权限' : '新增权限'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">权限名称 *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="例如：查看用户列表"
            />
          </div>
          <div>
            <label className="label">权限代码 *</label>
            <input
              type="text"
              className="input"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              placeholder="例如：user:list"
            />
          </div>
          <div>
            <label className="label">关联菜单</label>
            <select
              className="input"
              value={formData.menu_id}
              onChange={(e) => setFormData({ ...formData, menu_id: e.target.value })}
            >
              <option value="">无</option>
              {menus.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">描述</label>
            <textarea
              className="input h-20"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="权限描述说明"
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

export default Permissions
