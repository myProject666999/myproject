import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import Table from '../components/Table'
import Pagination from '../components/Pagination'
import Modal from '../components/Modal'
import dayjs from 'dayjs'
import { getUser } from '../utils/auth'

const statusOptions = [
  { value: 'new', label: '新机会' },
  { value: 'initial_contact', label: '初步接触中' },
  { value: 'requirement_analysis', label: '需求分析中' },
  { value: 'negotiation', label: '协商方案中' },
  { value: 'commercial_negotiation', label: '商业谈判中' },
  { value: 'completed', label: '已完成' },
  { value: 'lost', label: '已流失' },
]

const getStatusBadge = (status) => {
  const statusConfig = {
    new: { label: '新机会', class: 'bg-blue-100 text-blue-800' },
    initial_contact: { label: '初步接触中', class: 'bg-green-100 text-green-800' },
    requirement_analysis: { label: '需求分析中', class: 'bg-yellow-100 text-yellow-800' },
    negotiation: { label: '协商方案中', class: 'bg-orange-100 text-orange-800' },
    commercial_negotiation: { label: '商业谈判中', class: 'bg-purple-100 text-purple-800' },
    completed: { label: '已完成', class: 'bg-green-100 text-green-800' },
    lost: { label: '已流失', class: 'bg-red-100 text-red-800' },
  }
  const config = statusConfig[status] || { label: status, class: 'bg-gray-100 text-gray-800' }
  return <span className={`status-badge ${config.class}`}>{config.label}</span>
}

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([])
  const [customers, setCustomers] = useState([])
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingOpportunity, setEditingOpportunity] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    customer_id: '',
    status: 'new',
    amount: '',
    probability: 0,
    expected_close: '',
    description: '',
    assigned_to_id: '',
  })

  const currentUser = getUser()

  useEffect(() => {
    fetchOpportunities()
    fetchCustomers()
    fetchUsers()
  }, [page, pageSize, statusFilter])

  const fetchOpportunities = async () => {
    setLoading(true)
    try {
      const params = { page, page_size: pageSize }
      if (statusFilter) params.status = statusFilter
      const response = await api.get('/opportunities', { params })
      setOpportunities(response.data.data)
      setTotal(response.data.total)
    } catch (error) {
      console.error('Failed to fetch opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers/all')
      setCustomers(response.data)
    } catch (error) {
      console.error('Failed to fetch customers:', error)
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

  const handleSearch = () => {
    setPage(1)
    fetchOpportunities()
  }

  const openCreateModal = () => {
    setEditingOpportunity(null)
    setFormData({
      name: '',
      customer_id: customers[0]?.id || '',
      status: 'new',
      amount: '',
      probability: 0,
      expected_close: '',
      description: '',
      assigned_to_id: currentUser?.id || '',
    })
    setShowModal(true)
  }

  const openEditModal = (opportunity) => {
    setEditingOpportunity(opportunity)
    setFormData({
      name: opportunity.name,
      customer_id: opportunity.customer_id,
      status: opportunity.status,
      amount: opportunity.amount,
      probability: opportunity.probability,
      expected_close: opportunity.expected_close
        ? dayjs(opportunity.expected_close).format('YYYY-MM-DD')
        : '',
      description: opportunity.description,
      assigned_to_id: opportunity.assigned_to_id,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        probability: parseInt(formData.probability) || 0,
        expected_close: formData.expected_close
          ? dayjs(formData.expected_close).toISOString()
          : null,
      }

      if (editingOpportunity) {
        await api.put(`/opportunities/${editingOpportunity.id}`, data)
      } else {
        await api.post('/opportunities', data)
      }
      setShowModal(false)
      fetchOpportunities()
    } catch (error) {
      console.error('Failed to save opportunity:', error)
      alert(error.response?.data?.error || '保存失败')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('确定要删除这个业务机会吗？')) {
      try {
        await api.delete(`/opportunities/${id}`)
        fetchOpportunities()
      } catch (error) {
        console.error('Failed to delete opportunity:', error)
        alert('删除失败')
      }
    }
  }

  const columns = [
    { key: 'name', title: '机会名称' },
    { key: 'customer', title: '客户', render: (_, row) => row.customer?.name },
    { key: 'amount', title: '金额', align: 'right', render: (value) => `¥${value?.toLocaleString() || 0}` },
    { key: 'probability', title: '成功率', align: 'center', render: (value) => `${value || 0}%` },
    { key: 'status', title: '状态', render: (value) => getStatusBadge(value) },
    { key: 'assigned_to', title: '负责人', render: (_, row) => row.assigned_to?.real_name },
    {
      key: 'expected_close',
      title: '预计结束',
      render: (value) => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
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
          <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-800">
            删除
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800">业务机会</h2>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-auto"
            >
              <option value="">全部状态</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="搜索机会名称"
              className="input w-48"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="btn btn-secondary">
              搜索
            </button>
            <button onClick={openCreateModal} className="btn btn-primary">
              + 新增机会
            </button>
          </div>
        </div>
        <Table columns={columns} data={opportunities} loading={loading} />
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
        title={editingOpportunity ? '编辑业务机会' : '新增业务机会'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">机会名称 *</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">客户 *</label>
              <select
                className="input"
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                required
              >
                <option value="">请选择客户</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">金额 (元)</label>
              <input
                type="number"
                className="input"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="label">成功率 (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="input"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
              />
            </div>
            <div>
              <label className="label">状态</label>
              <select
                className="input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">预计结束日期</label>
              <input
                type="date"
                className="input"
                value={formData.expected_close}
                onChange={(e) => setFormData({ ...formData, expected_close: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="label">负责人</label>
              <select
                className="input"
                value={formData.assigned_to_id}
                onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
              >
                <option value="">请选择负责人</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.real_name} ({u.role?.name})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">描述</label>
              <textarea
                className="input h-24"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
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

export default Opportunities
