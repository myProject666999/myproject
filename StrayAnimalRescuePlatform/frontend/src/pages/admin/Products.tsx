import React, { useEffect, useState } from 'react'
import { Row, Col, Table, Button, Typography, Modal, Form, Input, Select, Space, message, Popconfirm, Image, Switch, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import api from '../../api'

const { Title } = Typography
const { TextArea } = Input

const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await api.get('/products')
      setProducts(data.list || [])
    } catch (error) {
      console.error('加载商品失败', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await api.get('/categories/product')
      setCategories(data.list || [])
    } catch (error) {
      console.error('加载分类失败', error)
    }
  }

  const showModal = (product?: any) => {
    setEditingProduct(product || null)
    if (product) {
      form.setFieldsValue(product)
    } else {
      form.resetFields()
    }
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, values)
        message.success('商品已更新')
      } else {
        await api.post('/admin/products', values)
        message.success('商品已添加')
      }
      setModalVisible(false)
      loadProducts()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/products/${id}`)
      message.success('商品已删除')
      loadProducts()
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
      title: '图片',
      key: 'image',
      render: (_: any, record: any) => (
        <Image
          src={record.cover_image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20product%20placeholder&image_size=square'}
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          preview={false}
        />
      ),
      width: 100
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '分类',
      key: 'category',
      render: (_: any, record: any) => record.product_category?.name
    },
    {
      title: '价格',
      key: 'price',
      render: (_: any, record: any) => <span style={{ color: '#ff4d4f' }}>¥{record.price}</span>
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock'
    },
    {
      title: '状态',
      key: 'status',
      render: (_: any, record: any) => (
        <Switch
          checked={record.status === 'active'}
          checkedChildren="上架"
          unCheckedChildren="下架"
          onChange={async (val) => {
            await api.put(`/admin/products/${record.id}`, { status: val ? 'active' : 'inactive' })
            loadProducts()
          }}
        />
      )
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
      <Title level={2} style={{ marginBottom: 24 }}>商品管理</Title>

      <Card style={{ marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          添加商品
        </Button>
      </Card>

      <Card>
        <Table
          dataSource={products}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingProduct ? '编辑商品' : '添加商品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="商品名称" rules={[{ required: true }]}>
            <Input placeholder="请输入商品名称" />
          </Form.Item>
          <Form.Item name="product_category_id" label="商品分类" rules={[{ required: true }]}>
            <Select placeholder="请选择分类">
              {categories.map((cat: any) => (
                <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="price" label="价格" rules={[{ required: true }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  placeholder="请输入价格"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="stock" label="库存" rules={[{ required: true }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="请输入库存"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="cover_image" label="封面图片URL">
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          <Form.Item name="description" label="商品描述">
            <TextArea rows={4} placeholder="请输入商品描述" />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="上架" unCheckedChildren="下架" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Products
