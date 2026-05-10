import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, InputNumber, Space, Popconfirm, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { scriptApi, scriptTypeApi } from '../../services/api'

function AdminScripts() {
  const [data, setData] = useState([])
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await scriptApi.adminList({
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
    scriptTypeApi.list().then(res => setTypes(res.data || []))
  }, [pagination.current, pagination.pageSize])

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    form.setFieldsValue({ status: 1, players: 4, duration: 120 })
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue({
      ...record,
      type_id: record.type_id
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    await scriptApi.remove(id)
    message.success('删除成功')
    loadData()
  }

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await scriptApi.update(editingRecord.id, values)
        message.success('更新成功')
      } else {
        await scriptApi.create(values)
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
    { title: '封面', dataIndex: 'cover', key: 'cover', render: v => v ? <img src={v} style={{ width: 60, height: 40 }} /> : '-' },
    { title: '剧本名称', dataIndex: 'title', key: 'title' },
    { title: '类型', dataIndex: ['type', 'name'], key: 'type' },
    { title: '价格', dataIndex: 'price', key: 'price', render: v => `¥${v}` },
    { title: '人数', dataIndex: 'players', key: 'players' },
    { title: '热度', dataIndex: 'hot', key: 'hot' },
    { title: '状态', dataIndex: 'status', key: 'status', render: v => v ? '已发布' : '未发布' },
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
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加剧本</Button>
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
        title={editingRecord ? '编辑剧本' : '添加剧本'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="剧本名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type_id" label="剧本类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select>
              {types.map(t => (
                <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="price" label="价格（元/人）" rules={[{ required: true, message: '请输入价格' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="players" label="人数" style={{ flex: 1 }}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="duration" label="时长（分钟）" style={{ flex: 1 }}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item name="cover" label="封面图片URL">
            <Input placeholder="图片链接" />
          </Form.Item>
          <Form.Item name="description" label="剧本描述">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Select.Option value={1}>已发布</Select.Option>
              <Select.Option value={0}>未发布</Select.Option>
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

export default AdminScripts
