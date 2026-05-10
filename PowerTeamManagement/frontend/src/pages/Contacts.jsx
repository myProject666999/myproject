import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import Table from '../components/Table'
import Pagination from '../components/Pagination'
import Modal from '../components/Modal'

const Contacts = () => {
  const [contacts, setContacts] = useState([])
  const [customers, setCustomers] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [customerFilter, setCustomerFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [formData, setFormData] = useState({
    customer_id: '',
    name: '',
    position: '',
    phone: '',
    email: '',
    wechat: '',
    address: '',
    is_primary: false,
    remark: '',
  })

  useEffect(() => {
    fetchContacts()
    fetchCustomers()
  }, [page, pageSize, customerFilter])

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const params = { page, page_size: pageSize }
      if (customerFilter) params.customer_id = customerFilter
      if (search) params.search = search
      const response = await api.get('/contacts', { params })
      setContacts(response.data.data)
      setTotal(response.data.total)
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
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

  const handleSearch = () => {
    setPage(1)
    fetchContacts()
  }

  const openCreateModal = () => {
    setEditingContact(null)
    setFormData({
      customer_id: customers[0]?.id || '',
      name: '',
      position: '',
      phone: '',
      email: '',
      wechat: '',
      address: '',
      is_primary: false,
      remark: '',
    })
    setShowModal(true)
  }

  const openEditModal = (contact) => {
    setEditingContact(contact)
    setFormData({
      customer_id: Number(contact.customer_id),
      name: contact.name,
      position: contact.position,
      phone: contact.phone,
      email: contact.email,
      wechat: contact.wechat,
      address: contact.address,
      is_primary: contact.is_primary,
      remark: contact.remark,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        customer_id: Number(formData.customer_id),
      }
      if (editingContact) {
        await api.put(`/contacts/${editingContact.id}`, submitData)
      } else {
        await api.post('/contacts', submitData)
      }
      setShowModal(false)
      fetchContacts()
    } catch (error) {
      console.error('Failed to save contact:', error)
      alert(error.response?.data?.error || '保存失败')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('确定要删除这个联系人吗？')) {
      try {
        await api.delete(`/contacts/${id}`)
        fetchContacts()
      } catch (error) {
        console.error('Failed to delete contact:', error)
        alert('删除失败')
      }
    }
  }

  const columns = [
    { key: 'name', title: '姓名' },
    { key: 'customer', title: '所属客户', render: (_, row) => row.customer?.name },
    { key: 'position', title: '职位' },
    { key: 'phone', title: '电话' },
    { key: 'email', title: '邮箱' },
    { key: 'wechat', title: '微信' },
    {
      key: 'is_primary',
      title: '主要联系人',
      align: 'center',
      render: (value) =>
        value ? (
          <span className="status-badge bg-green-100 text-green-800">是</span>
        ) : (
          <span className="status-badge bg-gray-100 text-gray-600">否</span>
        ),
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
          <h2 className="text-xl font-semibold text-gray-800">联系人管理</h2>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="input w-auto"
            >
              <option value="">全部客户</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="搜索姓名/电话/邮箱"
              className="input w-48"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="btn btn-secondary">
              搜索
            </button>
            <button onClick={openCreateModal} className="btn btn-primary">
              + 新增联系人
            </button>
          </div>
        </div>
        <Table columns={columns} data={contacts} loading={loading} />
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
        title={editingContact ? '编辑联系人' : '新增联系人'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">所属客户 *</label>
            <select
              className="input"
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: Number(e.target.value) })}
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
            <label className="label">姓名 *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">职位</label>
              <input
                type="text"
                className="input"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
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
              <label className="label">微信</label>
              <input
                type="text"
                className="input"
                value={formData.wechat}
                onChange={(e) => setFormData({ ...formData, wechat: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">地址</label>
            <input
              type="text"
              className="input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_primary}
                onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
              />
              <span className="text-sm">设为主要联系人</span>
            </label>
          </div>
          <div>
            <label className="label">备注</label>
            <textarea
              className="input h-20"
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
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

export default Contacts
