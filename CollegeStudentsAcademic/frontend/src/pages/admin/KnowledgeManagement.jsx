import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Select, Tag, Upload } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons'
import { adminApi } from '../../utils/api'

const statusMap = { 0: '草稿', 1: '已发布' }

function KnowledgeManagement() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, page_size: 10, total: 0 })
  const [filters, setFilters] = useState({ keyword: '', category: '' })
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [form] = Form.useForm()
  const [isEdit, setIsEdit] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await adminApi.getKnowledge({ ...filters, page: pagination.page, page_size: pagination.page_size })
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
        await adminApi.updateKnowledge(currentRecord.id, values)
        message.success('修改成功')
      } else {
        await adminApi.createKnowledge(values)
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
    { title: '标题', dataIndex: 'title' },
    { title: '分类', dataIndex: 'category' },
    { title: '作者', dataIndex: 'author' },
    { title: '浏览量', dataIndex: 'views' },
    { title: '状态', dataIndex: 'status', render: v => <Tag color={v ? 'green' : 'orange'}>{statusMap[v]}</Tag> },
    { title: '创建时间', dataIndex: 'created_at' },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => { setCurrentRecord(record); setDetailModal(true) }}>详情</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
          {record.attachment && (
            <Button type="link" icon={<DownloadOutlined />} onClick={() => window.open(adminApi.downloadKnowledge(record.id))}>下载附件</Button>
          )}
          <Popconfirm title="确定删除吗？" onConfirm={() => adminApi.deleteKnowledge(record.id).then(loadData)}>
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>知识管理</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增知识</Button>
      </div>
      
      <Form layout="inline" onFinish={(v) => { setFilters(v); setPagination(p => ({ ...p, page: 1 })) }} style={{ marginBottom: 16 }}>
        <Form.Item name="keyword"><Input placeholder="关键词" style={{ width: 200 }} /></Form.Item>
        <Form.Item name="category"><Input placeholder="分类" style={{ width: 150 }} /></Form.Item>
        <Form.Item><Button type="primary" htmlType="submit" icon={<SearchOutlined />}>搜索</Button></Form.Item>
      </Form>

      <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
        pagination={{ current: pagination.page, pageSize: pagination.page_size, total: pagination.total, onChange: page => setPagination(p => ({ ...p, page })) }} />

      <Modal title={isEdit ? '编辑知识' : '新增知识'} open={modalVisible} onCancel={() => setModalVisible(false)} footer={null} width={700}>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="category" label="分类"><Input /></Form.Item>
          <Form.Item name="author" label="作者"><Input /></Form.Item>
          <Form.Item name="summary" label="摘要"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="content" label="内容"><Input.TextArea rows={6} /></Form.Item>
          <Form.Item name="attachment" label="附件路径"><Input placeholder="如: ./uploads/file.pdf" /></Form.Item>
          <Form.Item name="attachment_name" label="附件名称"><Input /></Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Select.Option value={1}>已发布</Select.Option>
              <Select.Option value={0}>草稿</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" block>确定</Button></Form.Item>
        </Form>
      </Modal>

      <Modal title="知识详情" open={detailModal} onCancel={() => setDetailModal(false)} footer={null} width={700}>
        {currentRecord && (
          <div style={{ lineHeight: 2 }}>
            <h3>{currentRecord.title}</h3>
            <p style={{ color: '#999' }}>分类: {currentRecord.category || '-'} | 作者: {currentRecord.author || '-'} | 浏览: {currentRecord.views}</p>
            <p><b>摘要:</b> {currentRecord.summary || '-'}</p>
            <hr />
            <p style={{ whiteSpace: 'pre-wrap' }}>{currentRecord.content}</p>
            {currentRecord.attachment && (
              <Button type="link" icon={<DownloadOutlined />} onClick={() => window.open(adminApi.downloadKnowledge(currentRecord.id))}>
                下载附件: {currentRecord.attachment_name || currentRecord.attachment}
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default KnowledgeManagement
