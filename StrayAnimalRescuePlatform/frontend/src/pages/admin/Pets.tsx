import React, { useEffect, useState } from 'react'
import { Table, Button, Typography, Modal, Form, Input, Select, Space, message, Popconfirm, Image, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import api from '../../api'

const { Title } = Typography
const { TextArea } = Input

const Pets: React.FC = () => {
  const [pets, setPets] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingPet, setEditingPet] = useState<any>(null)
  const [adoptModalVisible, setAdoptModalVisible] = useState(false)
  const [adoptions, setAdoptions] = useState<any[]>([])
  const [form] = Form.useForm()

  useEffect(() => {
    loadPets()
    loadCategories()
    loadAdoptions()
  }, [])

  const loadPets = async () => {
    setLoading(true)
    try {
      const data = await api.get('/pets')
      setPets(data.list || [])
    } catch (error) {
      console.error('加载宠物失败', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await api.get('/categories/pet')
      setCategories(data.list || [])
    } catch (error) {
      console.error('加载分类失败', error)
    }
  }

  const loadAdoptions = async () => {
    try {
      const data = await api.get('/admin/adoptions')
      setAdoptions(data.list || [])
    } catch (error) {
      console.error('加载领养记录失败', error)
    }
  }

  const showModal = (pet?: any) => {
    setEditingPet(pet || null)
    if (pet) {
      form.setFieldsValue(pet)
    } else {
      form.resetFields()
    }
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingPet) {
        await api.put(`/admin/pets/${editingPet.id}`, values)
        message.success('宠物信息已更新')
      } else {
        await api.post('/admin/pets', values)
        message.success('宠物已添加')
      }
      setModalVisible(false)
      loadPets()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/pets/${id}`)
      message.success('宠物已删除')
      loadPets()
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      available: { color: 'green', text: '可领养' },
      adopted: { color: 'blue', text: '已领养' },
      pending: { color: 'orange', text: '待审核' }
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
      key: 'photo',
      render: (_: any, record: any) => (
        <Image
          src={record.photo || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20placeholder&image_size=square'}
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          preview={false}
        />
      ),
      width: 100
    },
    {
      title: '名字',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '分类',
      key: 'category',
      render: (_: any, record: any) => record.pet_category?.name
    },
    {
      title: '品种',
      dataIndex: 'breed',
      key: 'breed'
    },
    {
      title: '年龄',
      key: 'age',
      render: (_: any, record: any) => `${record.age_months || 0}个月`
    },
    {
      title: '状态',
      key: 'status',
      render: (_: any, record: any) => getStatusTag(record.status)
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

  const adoptColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '宠物',
      key: 'pet',
      render: (_: any, record: any) => record.pet?.name
    },
    {
      title: '申请人',
      key: 'user',
      render: (_: any, record: any) => record.user?.nickname || record.user?.username
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '状态',
      key: 'status',
      render: (_: any, record: any) => getStatusTag(record.status)
    },
    {
      title: '申请时间',
      key: 'created_at',
      render: (_: any, record: any) => new Date(record.created_at).toLocaleString()
    }
  ]

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>宠物管理</Title>

      <Card style={{ marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          添加宠物
        </Button>
        <Button style={{ marginLeft: 16 }} onClick={() => setAdoptModalVisible(true)}>
          领养记录
        </Button>
      </Card>

      <Card>
        <Table
          dataSource={pets}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingPet ? '编辑宠物' : '添加宠物'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="名字" rules={[{ required: true }]}>
            <Input placeholder="请输入名字" />
          </Form.Item>
          <Form.Item name="pet_category_id" label="分类" rules={[{ required: true }]}>
            <Select placeholder="请选择分类">
              {categories.map((cat: any) => (
                <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="breed" label="品种">
            <Input placeholder="请输入品种" />
          </Form.Item>
          <Form.Item name="age_months" label="年龄(月)">
            <Input type="number" placeholder="请输入年龄" />
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Select placeholder="请选择性别">
              <Select.Option value="male">公</Select.Option>
              <Select.Option value="female">母</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="photo" label="照片URL">
            <Input placeholder="请输入照片URL" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={4} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="available">
            <Select>
              <Select.Option value="available">可领养</Select.Option>
              <Select.Option value="adopted">已领养</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="领养记录"
        open={adoptModalVisible}
        onCancel={() => setAdoptModalVisible(false)}
        width={900}
        footer={null}
      >
        <Table
          dataSource={adoptions}
          columns={adoptColumns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Modal>
    </div>
  )
}

export default Pets
