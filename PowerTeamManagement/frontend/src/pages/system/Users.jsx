import React, { useState, useEffect } from 'react'
import api from '../../utils/api'
import Table from '../../components/Table'
import Pagination from '../../components/Pagination'
import Modal from '../../components/Modal'

const Users = () => {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    real_name: '',
    email: '',
    phone: '',
    role_id: '',
    organization_id: '',
  })

  useEffect(() => {
    fetchUsers()
    fetchRoles()
    fetchOrganizations()
  }, [page, pageSize])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/users', { params: { page, page_size: pageSize, search } })
      setUsers(response.data.data)
      setTotal(response.data.total)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles')
      setRoles(response.data)
    } catch (error) {
      console.error('Failed to fetch roles:', error)
    }
  }

  const fetchOrganizations = async () => {
    try {
      const response = await api.get('/organizations')
      setOrganizations(response.data)
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchUsers()
  }

  const openCreateModal = () => {
    setEditingUser(null)
    setFormData({
      username: '',
      password: '',
      real_name: '',
      email: '',
      phone: '',
      role_id: roles[0]?.id || '',
      organization_id: organizations[0]?.id || '',
    })
    setShowModal(true)
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: '',
      real_name: user.real_name,
      email: user.email || '',
      phone: user.phone || '',
      role_id: user.role_id,
      organization_id: user.organization_id || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = { ...formData }
      if (!data.password) delete data.password
      if (!data.organization_id) delete data.organization_id

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, data)
      } else {
        await api.post('/users', data)
      }
      setShowModal(false)
      fetchUsers()
    } catch (error) {
      console.error('Failed to save user:', error)
      alert(error.response?.data?.error || '保存失败')
    }
  }

  const handleDelete = async (user) => {
    if (confirm(`确定要删除用户「${user.real_name}」吗？`)) {
      try {
        await api.delete(`/users/${user.id}`)
        fetchUsers()
      } catch (error) {
        console.error('Failed to delete user:', error)
        alert(error.response?.data?.error || '删除失败')
      }
    }
  }

  const columns = [
    { key: 'username', title: '用户名' },
    { key: 'real_name', title: '姓名' },
    { key: 'email', title: '邮箱' },
    { key: 'phone', title: '电话' },
    { key: 'role', title: '角色', render: (_, row) => row.role?.name },
    { key: 'organization', title: '所属组织', render: (_, row) => row.organization?.name || '-' },
    {
      key: 'actions',
      title: '操作',
      width: '150px',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => openEditModal(row)} className="text-blue-600 hover:text-blue-800">
            编辑
          </button>
          {row.username !== 'admin' && (
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
        <div className="px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800">用户管理</h2>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="搜索用户名/姓名/邮箱"
              className="input w-48"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="btn btn-secondary">
              搜索
            </button>
            <button onClick={openCreateModal} className="btn btn-primary">
              + 新增用户
            </button>
          </div>
        </div>
        <Table columns={columns} data={users} loading={loading} />
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? '编辑用户' : '新增用户'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">用户名 *</label>
            <input
              type="text"
              className="input"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={!!editingUser}
              required
            />
          </div>
          <div>
            <label className="label">
              密码 {editingUser ? '(留空则不修改)' : '*'}
            </label>
            <input
              type="password"
              className="input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
            />
          </div>
          <div>
            <label className="label">姓名 *</label>
            <input
              type="text"
              className="input"
              value={formData.real_name}
              onChange={(e) => setFormData({ ...formData, real_name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">邮箱</label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">电话</label>
              <input
                type="text"
                className="input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">角色 *</label>
            <select
              className="input"
              value={formData.role_id}
              onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
              required
            >
              <option value="">请选择角色</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">所属组织</label>
            <select
              className="input"
              value={formData.organization_id}
              onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
            >
              <option value="">无</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
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

export default Users
