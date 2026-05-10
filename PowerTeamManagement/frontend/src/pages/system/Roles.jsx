import React, { useState, useEffect } from 'react'
import api from '../../utils/api'
import Table from '../../components/Table'
import Modal from '../../components/Modal'

const Roles = () => {
  const [roles, setRoles] = useState([])
  const [menus, setMenus] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const [formData, setFormData] = useState({ name: '', code: '', description: '' })
  const [selectedMenus, setSelectedMenus] = useState([])
  const [selectedPermissions, setSelectedPermissions] = useState([])

  useEffect(() => {
    fetchRoles()
    fetchMenus()
    fetchPermissions()
  }, [])

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const response = await api.get('/roles')
      setRoles(response.data)
    } catch (error) {
      console.error('Failed to fetch roles:', error)
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

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions')
      setPermissions(response.data)
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    }
  }

  const openCreateModal = () => {
    setEditingRole(null)
    setFormData({ name: '', code: '', description: '' })
    setShowModal(true)
  }

  const openEditModal = (role) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      code: role.code,
      description: role.description,
    })
    setShowModal(true)
  }

  const openMenuModal = (role) => {
    setSelectedRole(role)
    setSelectedMenus(role.menus?.map((m) => m.id) || [])
    setShowMenuModal(true)
  }

  const openPermissionModal = (role) => {
    setSelectedRole(role)
    setSelectedPermissions(role.permissions?.map((p) => p.id) || [])
    setShowPermissionModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingRole) {
        await api.put(`/roles/${editingRole.id}`, formData)
      } else {
        await api.post('/roles', formData)
      }
      setShowModal(false)
      fetchRoles()
    } catch (error) {
      console.error('Failed to save role:', error)
      alert(error.response?.data?.error || '保存失败')
    }
  }

  const handleDelete = async (role) => {
    if (confirm(`确定要删除角色「${role.name}」吗？`)) {
      try {
        await api.delete(`/roles/${role.id}`)
        fetchRoles()
      } catch (error) {
        console.error('Failed to delete role:', error)
        alert(error.response?.data?.error || '删除失败')
      }
    }
  }

  const handleAssignMenus = async () => {
    try {
      await api.post(`/roles/${selectedRole.id}/menus`, { menu_ids: selectedMenus })
      alert('菜单分配成功')
      setShowMenuModal(false)
      fetchRoles()
    } catch (error) {
      console.error('Failed to assign menus:', error)
      alert('分配失败')
    }
  }

  const handleAssignPermissions = async () => {
    try {
      await api.post(`/roles/${selectedRole.id}/permissions`, { permission_ids: selectedPermissions })
      alert('权限分配成功')
      setShowPermissionModal(false)
      fetchRoles()
    } catch (error) {
      console.error('Failed to assign permissions:', error)
      alert('分配失败')
    }
  }

  const toggleMenu = (menuId) => {
    setSelectedMenus((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    )
  }

  const togglePermission = (permId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    )
  }

  const columns = [
    { key: 'name', title: '角色名称' },
    { key: 'code', title: '角色编码' },
    { key: 'description', title: '描述' },
    {
      key: 'menu_count',
      title: '菜单数',
      align: 'center',
      render: (_, row) => row.menus?.length || 0,
    },
    {
      key: 'perm_count',
      title: '权限数',
      align: 'center',
      render: (_, row) => row.permissions?.length || 0,
    },
    {
      key: 'actions',
      title: '操作',
      width: '250px',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => openMenuModal(row)} className="text-green-600 hover:text-green-800">
            分配菜单
          </button>
          <button
            onClick={() => openPermissionModal(row)}
            className="text-purple-600 hover:text-purple-800"
          >
            分配权限
          </button>
          <button onClick={() => openEditModal(row)} className="text-blue-600 hover:text-blue-800">
            编辑
          </button>
          {!['admin', 'sales_manager', 'salesperson'].includes(row.code) && (
            <button onClick={() => handleDelete(row)} className="text-red-600 hover:text-red-800">
              删除
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">角色管理</h2>
          <button onClick={openCreateModal} className="btn btn-primary">
            + 新增角色
          </button>
        </div>
        <Table columns={columns} data={roles} loading={loading} />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRole ? '编辑角色' : '新增角色'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">角色名称 *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">角色编码 *</label>
            <input
              type="text"
              className="input"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              disabled={!!editingRole}
              required
            />
          </div>
          <div>
            <label className="label">描述</label>
            <textarea
              className="input h-20"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

      <Modal
        isOpen={showMenuModal}
        onClose={() => setShowMenuModal(false)}
        title={`分配菜单 - ${selectedRole?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="max-h-96 overflow-y-auto">
            {menus.length === 0 ? (
              <p className="text-center text-gray-500 py-8">暂无菜单</p>
            ) : (
              <div className="space-y-2">
                {menus.map((menu) => (
                  <label
                    key={menu.id}
                    className="flex items-center gap-3 p-3 rounded hover:bg-gray-50 cursor-pointer border"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMenus.includes(menu.id)}
                      onChange={() => toggleMenu(menu.id)}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">{menu.name}</span>
                    <span className="text-sm text-gray-500">{menu.path}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setShowMenuModal(false)} className="btn btn-secondary">
              取消
            </button>
            <button onClick={handleAssignMenus} className="btn btn-primary">
              确认分配
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        title={`分配权限 - ${selectedRole?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="max-h-96 overflow-y-auto">
            {permissions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">暂无权限</p>
            ) : (
              <div className="space-y-2">
                {permissions.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-center gap-3 p-3 rounded hover:bg-gray-50 cursor-pointer border"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(perm.id)}
                      onChange={() => togglePermission(perm.id)}
                      className="w-4 h-4"
                    />
                    <div>
                      <div className="font-medium">{perm.name}</div>
                      <div className="text-sm text-gray-500">
                        {perm.code} - {perm.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setShowPermissionModal(false)} className="btn btn-secondary">
              取消
            </button>
            <button onClick={handleAssignPermissions} className="btn btn-primary">
              确认分配
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Roles
