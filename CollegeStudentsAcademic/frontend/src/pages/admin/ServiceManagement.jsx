import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Select, InputNumber, Tag } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { adminApi } from '../../utils/api'

const statusMap = { 0: '下架', 1: '上架' }

function ServiceManagement() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, page_size: 10, total: 0 })
  const [filters, setFilters] = useState({ keyword: '', category: '', status: '' })
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [form] = Form.useForm()
  const [isEdit, setIsEdit] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await adminApi.getServices({ ...filters, page: pagination.page, page_size: pagination.page_size })
      setData(result.list || [])
      setPagination(p => ({ ...p, total: result.total || 0 }))
    } catch (error) {
      message.error('加载失败')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [pagination.page, filters])

  const handleSubmit = async (values) => {
    try {
      if (isEdit) {
        await adminApi.updateService(currentRecord.id, values)
        message.success('修改成功')
      } else {
        await adminApi.createService(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      form.resetFields()
      loadData()
    } catch (error) {
      message.error(error.message || '操作失败')
    }
  }

  const openCreate = () => {
    setIsEdit(false)
    setCurrentRecord(null)
    form.resetFields()
    form.setFieldsValue({ status: 1 })
    setModalVisible(true)
  }

  const openEdit = (record) => {
    setIsEdit(true)
    setCurrentRecord(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '服务名称', dataIndex: 'title' },
    { title: '分类', dataIndex: 'category' },
    { title: '咨询顾问', dataIndex: 'consultant' },
    { title: '价格', dataIndex: 'price', render: v => `¥${v}` },
    { title: '时长', dataIndex: 'duration' },
    { title: '状态', dataIndex: 'status', render: v => <Tag color={v ? 'green' : 'red'}>{statusMap[v]}</Tag> },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => { setCurrentRecord(record); setDetailModal(true) }}>详情</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除吗？" onConfirm={() => adminApi.deleteService(record.id).then(loadData)}>
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>服务管理</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增服务</Button>
      </div>
      
      <Form layout="inline" onFinish={(v) => { setFilters(v); setPagination(p => ({ ...p, page: 1 })) }} style={{ marginBottom: 16 }}>
        <Form.Item name="keyword"><Input placeholder="关键词" style={{ width: 200 }} /></Form.Item>
        <Form.Item name="category"><Input placeholder="分类" style={{ width: 150 }} /></Form.Item>
        <Form.Item name="status">
          <Select placeholder="全部状态" style={{ width: 120 }} allowClear>
            <Select.Option value="">全部</Select.Option>
            <Select.Option value="1">上架</Select.Option>
            <Select.Option value="0">下架</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item><Button type="primary" htmlType="submit" icon={<SearchOutlined />}>搜索</Button></Form.Item>
      </Form>

      <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
        pagination={{ current: pagination.page, pageSize: pagination.page_size, total: pagination.total, onChange: page => setPagination(p => ({ ...p, page })) }} />

      <Modal title={isEdit ? '编辑服务' : '新增服务'} open={modalVisible} onCancel={() => setModalVisible(false)} footer={null} width={600}>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="title" label="服务名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="category" label="分类"><Input /></Form.Item>
          <Form.Item name="consultant" label="咨询顾问"><Input /></Form.Item>
          <Form.Item name="price" label="价格"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="duration" label="时长"><Input placeholder="如: 60分钟" /></Form.Item>
          <Form.Item name="description" label="简介"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="content" label="详细内容"><Input.TextArea rows={4} /></Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Select.Option value={1}>上架</Select.Option>
              <Select.Option value={0}>下架</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" block>确定</Button></Form.Item>
        </Form>
      </Modal>

      <Modal title="服务详情" open={detailModal} onCancel={() => setDetailModal(false)} footer={null} width={600}>
        {currentRecord && (
          <div style={{ lineHeight: 2 }}>
            <h3>{currentRecord.title}</h3>
            <p><b>分类:</b> {currentRecord.category || '-'}</p>
            <p><b>顾问:</b> {currentRecord.consultant || '-'}</p>
            <p><b>价格:</b> ¥{currentRecord.price}</p>
            <p><b>时长:</b> {currentRecord.duration || '-'}</p>
            <p><b>简介:</b> {currentRecord.description || '-'}</p>
            <p><b>内容:</b> {currentRecord.content || '-'}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ServiceManagement
