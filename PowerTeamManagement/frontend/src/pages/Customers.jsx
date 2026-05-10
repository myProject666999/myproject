import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import Table from '../components/Table'
import Pagination from '../components/Pagination'
import Modal from '../components/Modal'
import dayjs from 'dayjs'

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [contacts, setContacts] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    industry: '',
    address: '',
    website: '',
    remark: '',
  })
  const [contactForm, setContactForm] = useState({
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
    fetchCustomers()
  }, [page, pageSize])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/customers', {
        params: { page, page_size: pageSize, search },
      })
      setCustomers(response.data.data)
      setTotal(response.data.total)
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchCustomers()
  }

  const openCreateModal = () => {
    setEditingCustomer(null)
    setFormData({
      name: '',
      company: '',
      industry: '',
      address: '',
      website: '',
      remark: '',
    })
    setShowModal(true)
  }

  const openEditModal = (customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      company: customer.company,
      industry: customer.industry,
      address: customer.address,
      website: customer.website,
      remark: customer.remark,
    })
    setShowModal(true)
  }

  const openContactModal = async (customer) => {
    setSelectedCustomer(customer)
    setContactForm({
      name: '',
      position: '',
      phone: '',
      email: '',
      wechat: '',
      address: '',
      is_primary: false,
      remark: '',
    })
    try {
      const response = await api.get('/contacts', { params: { customer_id: customer.id } })
      setContacts(response.data.data)
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    }
    setShowContactModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, formData)
      } else {
        await api.post('/customers', formData)
      }
      setShowModal(false)
      fetchCustomers()
    } catch (error) {
      console.error('Failed to save customer:', error)
      alert(error.response?.data?.error || '保存失败')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('确定要删除这个客户吗？相关联系人也会被删除。')) {
      try {
        await api.delete(`/customers/${id}`)
        fetchCustomers()
      } catch (error) {
        console.error('Failed to delete customer:', error)
        alert('删除失败')
      }
    }
  }

  const handleAddContact = async (e) => {
    e.preventDefault()
    try {
      await api.post('/contacts', {
        ...contactForm,
        customer_id: selectedCustomer.id,
      })
      setContactForm({
        name: '',
        position: '',
        phone: '',
        email: '',
        wechat: '',
        address: '',
        is_primary: false,
        remark: '',
      })
      const response = await api.get('/contacts', { params: { customer_id: selectedCustomer.id } })
      setContacts(response.data.data)
    } catch (error) {
      console.error('Failed to add contact:', error)
      alert('添加联系人失败')
    }
  }

  const handleDeleteContact = async (contactId) => {
    if (confirm('确定要删除这个联系人吗？')) {
      try {
        await api.delete(`/contacts/${contactId}`)
        const response = await api.get('/contacts', { params: { customer_id: selectedCustomer.id } })
        setContacts(response.data.data)
      } catch (error) {
        console.error('Failed to delete contact:', error)
        alert('删除联系人失败')
      }
    }
  }

  const columns = [
    { key: 'name', title: '客户名称' },
    { key: 'company', title: '公司名称' },
    { key: 'industry', title: '所属行业' },
    { key: 'address', title: '地址' },
    { key: 'website', title: '网站' },
    {
      key: 'contact_count',
      title: '联系人数量',
      align: 'center',
      render: (_, row) => row.contacts?.length || 0,
    },
    {
      key: 'created_at',
      title: '创建时间',
      render: (value) => dayjs(value).format('YYYY-MM-DD'),
    },
    {
      key: 'actions',
      title: '操作',
      width: '200px',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => openContactModal(row)}
            className="text-green-600 hover:text-green-800"
          >
            联系人
          </button>
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
          <h2 className="text-xl font-semibold text-gray-800">客户管理</h2>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="搜索客户名称/公司"
              className="input w-48"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="btn btn-secondary">
              搜索
            </button>
            <button onClick={openCreateModal} className="btn btn-primary">
              + 新增客户
            </button>
          </div>
        </div>
        <Table columns={columns} data={customers} loading={loading} />
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
        title={editingCustomer ? '编辑客户' : '新增客户'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">客户名称 *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">公司名称</label>
            <input
              type="text"
              className="input"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>
          <div>
            <label className="label">所属行业</label>
            <input
              type="text"
              className="input"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            />
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
            <label className="label">网站</label>
            <input
              type="text"
              className="input"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>
          <div>
            <label className="label">备注</label>
            <textarea
              className="input h-24"
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

      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title={`联系人管理 - ${selectedCustomer?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <form onSubmit={handleAddContact} className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">新增联系人</h4>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="姓名 *"
                className="input"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="职位"
                className="input"
                value={contactForm.position}
                onChange={(e) => setContactForm({ ...contactForm, position: e.target.value })}
              />
              <input
                type="text"
                placeholder="电话"
                className="input"
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              />
              <input
                type="email"
                placeholder="邮箱"
                className="input"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="微信"
                className="input"
                value={contactForm.wechat}
                onChange={(e) => setContactForm({ ...contactForm, wechat: e.target.value })}
              />
              <input
                type="text"
                placeholder="地址"
                className="input"
                value={contactForm.address}
                onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={contactForm.is_primary}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, is_primary: e.target.checked })
                  }
                />
                <span className="text-sm">设为主要联系人</span>
              </label>
              <button type="submit" className="btn btn-primary">
                添加联系人
              </button>
            </div>
          </form>

          <div>
            <h4 className="font-medium text-gray-700 mb-3">联系人列表</h4>
            {contacts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">暂无联系人</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>姓名</th>
                    <th>职位</th>
                    <th>电话</th>
                    <th>邮箱</th>
                    <th>主要联系人</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id}>
                      <td>{contact.name}</td>
                      <td>{contact.position}</td>
                      <td>{contact.phone}</td>
                      <td>{contact.email}</td>
                      <td>
                        {contact.is_primary && (
                          <span className="status-badge bg-green-100 text-green-800">是</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={() => setShowContactModal(false)} className="btn btn-secondary">
              关闭
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Customers
