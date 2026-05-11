import React, { useEffect, useState } from 'react'
import { Table, Button, Typography, Modal, Form, Input, Select, Space, message, Popconfirm, Image, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import api from '../../api'

const { Title } = Typography
const { TextArea } = Input

const Shops: React.FC = () => {
  const [shops, setShops] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingShop, setEditingShop] = useState<any>(null)
  const [boardingModalVisible, setBoardingModalVisible] = useState(false)
  const [boardings, setBoardings] = useState<any[]>([])
  const [form] = Form.useForm()

  useEffect(() => {
    loadShops()
    loadBoardings()
  }, [])

  const loadShops = async () => {
    setLoading(true)
    try {
      const data = await api.get('/shops')
      setShops(data.list || [])
    } catch (error) {
      console.error('加载商店失败', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBoardings = async () => {
    try {
      const data = await api.get('/admin/boardings')
      setBoardings(data.list || [])
    } catch (error) {
      console.error('加载寄存记录失败', error)
    }
  }

  const showModal = (shop?: any) => {
    setEditingShop(shop || null)
    if (shop) {
      form.setFieldsValue(shop)
    } else {
      form.resetFields()
    }
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingShop) {
        await api.put(`/admin/shops/${editingShop.id}`, values)
        message.success('商店已更新')
      } else {
        await api.post('/admin/shops', values)
        message.success('商店已添加')
      }
      setModalVisible(false)
      loadShops()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/shops/${id}`)
      message.success('商店已删除')
      loadShops()
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  const handleBoardingAction = async (id: number, action: string) => {
    try {
      await api.post(`/admin/boardings/${id}/${action}`)
      message.success(action === 'approve' ? '已通过' : '已拒绝')
      loadBoardings()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: '待审核' },
      approved: { color: 'green', text: '已通过' },
      rejected: { color: 'red', text: '已拒绝' },
      completed: { color: 'blue', text: '已完成' }
    }
    const info = statusMap[status] || { color: 'default', text: status }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '图片',
      key: 'image',
      render: (_: any, record: any) => (
        <Image
          src={record.cover_image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20shop%20placeholder&image_size=square'}
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          preview={false}
        />
      ),
      width: 100
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address'
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '创建时间',
      key: 'created_at',
      render: (_: any, record: any) => new Date(record.created_at).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const boardingColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '商店',
      key: 'shop',
      render: (_: any, record: any) => record.shop?.name
    },
    {
      title: '申请人',
      key: 'user',
      render: (_: any, record: any) => record.user?.nickname || record.user?.username
    },
    {
      title: '联系电话',
      dataIndex: 'contact_phone',
      key: 'contact_phone'
    },
    {
      title: '宠物类型',
      dataIndex: 'pet_type',
      key: 'pet_type'
    },
    {
      title: '状态',
      key: 'status',
      render: (_: any, record: any) => getStatusTag(record.status)
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => {
        if (record.status === 'pending') {
          return (
            <Space>
              <Button type="link" onClick={() => handleBoardingAction(record.id, 'approve')}>通过</Button>
              <Button type="link" danger onClick={() => handleBoardingAction(record.id, 'reject')}>拒绝</Button>
            </Space>
          )
        }
        return null
      }
    }
  ]

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>商店管理</Title>

      <Card style={{ marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          添加商店
        </Button>
        <Button style={{ marginLeft: 16 }} onClick={() => setBoardingModalVisible(true)}>
          寄存记录
        </Button>
      </Card>

      <Card>
        <Table
          dataSource={shops}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingShop ? '编辑商店' : '添加商店'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="商店名称" rules={[{ required: true }]}>
            <Input placeholder="请输入商店名称" />
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input placeholder="请输入地址" />
          </Form.Item>
          <Form.Item name="cover_image" label="封面图片URL">
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={4} placeholder="请输入描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="寄存记录"
        open={boardingModalVisible}
        onCancel={() => setBoardingModalVisible(false)}
        width={1000}
        footer={null}
      >
        <Table
          dataSource={boardings}
          columns={boardingColumns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Modal>
    </div>
  )
}

export default Shops
