import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import Modal from '../components/Modal'

const Organization = () => {
  const [organizations, setOrganizations] = useState([])
  const [users, setUsers] = useState([])
  const [showOrgModal, setShowOrgModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingOrg, setEditingOrg] = useState(null)
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [expandedOrgs, setExpandedOrgs] = useState({})
  const [orgForm, setOrgForm] = useState({ name: '', parent_id: '' })
  const [selectedUsers, setSelectedUsers] = useState([])
  const [orgUsers, setOrgUsers] = useState([])

  useEffect(() => {
    fetchOrganizations()
    fetchUsers()
  }, [])

  const fetchOrganizations = async () => {
    try {
      const response = await api.get('/organizations')
      setOrganizations(response.data)
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/all')
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const toggleOrg = (orgId) => {
    setExpandedOrgs((prev) => ({ ...prev, [orgId]: !prev[orgId] }))
  }

  const openCreateOrgModal = (parentId = null) => {
    setEditingOrg(null)
    setOrgForm({ name: '', parent_id: parentId || '' })
    setShowOrgModal(true)
  }

  const openEditOrgModal = (org) => {
    setEditingOrg(org)
    setOrgForm({ name: org.name, parent_id: org.parent_id || '' })
    setShowOrgModal(true)
  }

  const openAssignUserModal = async (org) => {
    setSelectedOrg(org)
    try {
      const response = await api.get(`/organizations/${org.id}/users`)
      setOrgUsers(response.data)
      setSelectedUsers(response.data.map((u) => u.id))
    } catch (error) {
      console.error('Failed to fetch org users:', error)
    }
    setShowUserModal(true)
  }

  const handleOrgSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        name: orgForm.name,
        parent_id: orgForm.parent_id ? parseInt(orgForm.parent_id) : null,
      }
      if (editingOrg) {
        await api.put(`/organizations/${editingOrg.id}`, data)
      } else {
        await api.post('/organizations', data)
      }
      setShowOrgModal(false)
      fetchOrganizations()
    } catch (error) {
      console.error('Failed to save organization:', error)
      alert('保存失败')
    }
  }

  const handleDeleteOrg = async (org) => {
    if (confirm(`确定要删除组织「${org.name}」吗？`)) {
      try {
        await api.delete(`/organizations/${org.id}`)
        fetchOrganizations()
      } catch (error) {
        console.error('Failed to delete organization:', error)
        alert(error.response?.data?.error || '删除失败')
      }
    }
  }

  const handleAssignUsers = async () => {
    try {
      await api.post(`/organizations/${selectedOrg.id}/assign-users`, {
        user_ids: selectedUsers,
      })
      alert('分配成功')
      setShowUserModal(false)
      fetchOrganizations()
    } catch (error) {
      console.error('Failed to assign users:', error)
      alert('分配失败')
    }
  }

  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const getAllOrgOptions = (orgs, level = 0) => {
    let options = []
    orgs.forEach((org) => {
      options.push({
        id: org.id,
        name: '　'.repeat(level) + org.name,
      })
      if (org.children && org.children.length > 0) {
        options = [...options, ...getAllOrgOptions(org.children, level + 1)]
      }
    })
    return options
  }

  const renderOrgTree = (orgs, level = 0) => {
    return orgs.map((org) => {
      const hasChildren = org.children && org.children.length > 0
      const isExpanded = expandedOrgs[org.id]

      return (
        <div key={org.id}>
          <div
            className={`flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 ${
              level > 0 ? 'ml-6' : ''
            }`}
            style={{ paddingLeft: `${12 + level * 24}px` }}
          >
            <div className="flex items-center gap-2">
              {hasChildren ? (
                <button onClick={() => toggleOrg(org.id)} className="text-gray-400 w-4">
                  {isExpanded ? '▼' : '▶'}
                </button>
              ) : (
                <span className="w-4"></span>
              )}
              <span className="text-lg">🏢</span>
              <span className="font-medium text-gray-800">{org.name}</span>
              {org.users && org.users.length > 0 && (
                <span className="status-badge bg-blue-100 text-blue-800">
                  {org.users.length}人
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openCreateOrgModal(org.id)}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                新增子部门
              </button>
              <button
                onClick={() => openAssignUserModal(org)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                分配用户
              </button>
              <button
                onClick={() => openEditOrgModal(org)}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                编辑
              </button>
              <button
                onClick={() => handleDeleteOrg(org)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                删除
              </button>
            </div>
          </div>
          {hasChildren && isExpanded && renderOrgTree(org.children, level + 1)}
        </div>
      )
    })
  }

  const orgOptions = getAllOrgOptions(organizations)

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">组织架构</h2>
          <button onClick={() => openCreateOrgModal()} className="btn btn-primary">
            + 新增组织
          </button>
        </div>
        <div className="p-4">
          {organizations.length === 0 ? (
            <p className="text-center text-gray-500 py-8">暂无组织架构，请添加</p>
          ) : (
            <div className="space-y-1">{renderOrgTree(organizations)}</div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showOrgModal}
        onClose={() => setShowOrgModal(false)}
        title={editingOrg ? '编辑组织' : '新增组织'}
      >
        <form onSubmit={handleOrgSubmit} className="space-y-4">
          <div>
            <label className="label">组织名称 *</label>
            <input
              type="text"
              className="input"
              value={orgForm.name}
              onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
              placeholder="请输入组织名称"
              required
            />
          </div>
          <div>
            <label className="label">上级组织</label>
            <select
              className="input"
              value={orgForm.parent_id}
              onChange={(e) => setOrgForm({ ...orgForm, parent_id: e.target.value })}
            >
              <option value="">无（顶级组织）</option>
              {orgOptions.map((opt) => (
                <option
                  key={opt.id}
                  value={opt.id}
                  disabled={editingOrg && opt.id === editingOrg.id}
                >
                  {opt.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowOrgModal(false)} className="btn btn-secondary">
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              保存
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={`分配用户 - ${selectedOrg?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="max-h-96 overflow-y-auto">
            {users.length === 0 ? (
              <p className="text-center text-gray-500 py-8">暂无用户</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded hover:bg-gray-50 cursor-pointer border"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="w-4 h-4"
                    />
                    <div>
                      <div className="font-medium">{user.real_name}</div>
                      <div className="text-sm text-gray-500">
                        {user.username} · {user.role?.name}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setShowUserModal(false)} className="btn btn-secondary">
              取消
            </button>
            <button onClick={handleAssignUsers} className="btn btn-primary">
              确认分配
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Organization
