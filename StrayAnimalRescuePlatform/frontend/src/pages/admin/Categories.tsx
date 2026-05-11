import React, { useEffect, useState } from 'react'
import { Table, Button, Typography, Modal, Form, Input, Select, Space, message, Popconfirm, Tabs } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import api from '../../api'

const { Title } = Typography

const Categories: React.FC = () => {
  const [petCategories, setPetCategories] = useState<any[]>([])
  const [productCategories, setProductCategories] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('pet')
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const pets = await api.get('/admin/categories/pet')
      const products = await api.get('/admin/categories/product')
      setPetCategories(pets.list || [])
      setProductCategories(products.list || [])
    } catch (error) {
      console.error('加载分类失败', error)
    } finally {
      setLoading(false)
    }
  }

  const currentList = activeTab === 'pet' ? petCategories : productCategories
  const currentName = activeTab === 'pet' ? '宠物分类' : '商品分类'
  const categoryPrefix = activeTab === 'pet' ? '/admin/pet-categories' : '/admin/product-categories'

  const showModal = (category?: any) => {
    setEditingCategory(category || null)
    if (category) {
      form.setFieldsValue(category)
    } else {
      form.resetFields()
    }
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingCategory) {
        await api.put(`${categoryPrefix}/${editingCategory.id}`, values)
        message.success('分类已更新')
      } else {
        await api.post(categoryPrefix, values)
        message.success('分类已添加')
      }
      setModalVisible(false)
      loadCategories()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`${categoryPrefix}/${id}`)
      message.success('分类已删除')
      loadCategories()
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 100
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

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>分类管理</Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="宠物分类" key="pet" />
        <Tabs.TabPane tab="商品分类" key="product" />
      </Tabs>

      <Card style={{ marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          添加{currentName}
        </Button>
      </Card>

      <Card>
        <Table
          dataSource={currentList}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingCategory ? '编辑分类' : `添加${currentName}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="分类名称" rules={[{ required: true }]}>
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="sort_order" label="排序" initialValue={0}>
            <Input.Number placeholder="排序数字" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Categories
