import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, message, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { carouselApi } from '../../services/api'

function AdminCarousels() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await carouselApi.adminList({
        page: pagination.current,
        page_size: pagination.pageSize
      })
      setData(res.data?.list || [])
      setPagination(prev => ({ ...prev, total: res.data?.total || 0 }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [pagination.current, pagination.pageSize])

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    form.setFieldsValue({ sort: 0, status: 1 })
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue({
      title: record.title,
      image: record.image,
      link: record.link,
      sort: record.sort,
      status: record.status
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    await carouselApi.remove(id)
    message.success('删除成功')
    loadData()
  }

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await carouselApi.update(editingRecord.id, values)
        message.success('更新成功')
      } else {
        await carouselApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (err) {
      // Error handled
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '图片', dataIndex: 'image', key: 'image', render: v => <img src={v} style={{ width: 100, height: 50, objectFit: 'cover' }} /> },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '链接', dataIndex: 'link', key: 'link' },
    { title: '排序', dataIndex: 'sort', key: 'sort' },
    { title: '状态', dataIndex: 'status', key: 'status', render: v => v ? '启用' : '禁用' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加轮播图</Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize })
        }}
      />

      <Modal
        title={editingRecord ? '编辑轮播图' : '添加轮播图'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="标题">
            <Input />
          </Form.Item>
          <Form.Item name="image" label="图片URL" rules={[{ required: true, message: '请输入图片URL' }]}>
            <Input placeholder="图片链接" />
          </Form.Item>
          <Form.Item name="link" label="跳转链接">
            <Input placeholder="点击轮播图跳转的链接" />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>保存</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminCarousels
