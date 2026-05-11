import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, Switch, message, Popconfirm, Typography, Image } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CommentOutlined } from '@ant-design/icons'
import { adminApi, publicApi } from '../../utils/api'
import dayjs from 'dayjs'

const { Title } = Typography
const { TextArea } = Input

function ProductManagement() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [commentModalVisible, setCommentModalVisible] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [comments, setComments] = useState([])
  const [filters, setFilters] = useState({ keyword: '', category_id: '' })
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [form] = Form.useForm()

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [pagination.current, pagination.pageSize, filters])

  const loadCategories = async () => {
    try {
      const res = await publicApi.getCategories()
      setCategories(res.data || [])
    } catch (error) {
      console.error(error)
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
        ...filters
      }
      const res = await adminApi.getProducts(params)
      setProducts(res.data.list || [])
      setPagination(p => ({ ...p, total: res.data.total }))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingProduct(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    form.setFieldsValue(product)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteProduct(id)
      message.success('删除成功')
      loadProducts()
    } catch (error) {
      console.error(error)
    }
  }

  const handleViewComments = async (id) => {
    setSelectedProductId(id)
    try {
      const res = await adminApi.getProductComments(id)
      setComments(res.data.list || [])
    } catch (error) {
      console.error(error)
    }
    setCommentModalVisible(true)
  }

  const handleDeleteComment = async (id) => {
    try {
      await adminApi.deleteComment(id)
      message.success('删除成功')
      adminApi.getProductComments(selectedProductId).then(res => {
        setComments(res.data.list || [])
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (values) => {
    try {
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, values)
      } else {
        await adminApi.createProduct(values)
      }
      message.success(editingProduct ? '更新成功' : '添加成功')
      setModalVisible(false)
      loadProducts()
    } catch (error) {
      console.error(error)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '商品图片',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image) => (
        <Image src={image || 'https://picsum.photos/50/50'} width={50} height={50} style={{ objectFit: 'cover' }} />
      )
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      key: 'category'
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{price}</span>
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock'
    },
    {
      title: '销量',
      dataIndex: 'sales',
      key: 'sales'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (status === 1 ? '上架' : '下架')
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => dayjs(time).format('YYYY-MM-DD')
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<CommentOutlined />} onClick={() => handleViewComments(record.id)}>评论</Button>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm
            title="确定要删除该商品吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>商品管理</Title>
      
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input.Search
            placeholder="搜索商品名称"
            allowClear
            enterButton={<SearchOutlined />}
            value={filters.keyword}
            onSearch={(value) => {
              setFilters(f => ({ ...f, keyword: value }))
              setPagination(p => ({ ...p, current: 1 }))
            }}
            style={{ width: 250 }}
          />
          <Select
            placeholder="选择分类"
            allowClear
            style={{ width: 150 }}
            value={filters.category_id || undefined}
            onChange={(value) => {
              setFilters(f => ({ ...f, category_id: value || '' }))
              setPagination(p => ({ ...p, current: 1 }))
            }}
          >
            {categories.map(cat => (
              <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
            ))}
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加商品
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => setPagination(p => ({ ...p, current: page, pageSize }))
        }}
      />

      <Modal
        title={editingProduct ? '编辑商品' : '添加商品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
            <Input placeholder="请输入商品名称" />
          </Form.Item>
          <Form.Item name="category_id" label="商品分类" rules={[{ required: true, message: '请选择商品分类' }]}>
            <Select placeholder="请选择商品分类">
              {categories.map(cat => (
                <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="price" label="售价" rules={[{ required: true, message: '请输入售价' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入售价" />
          </Form.Item>
          <Form.Item name="original_price" label="原价">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入原价" />
          </Form.Item>
          <Form.Item name="stock" label="库存" rules={[{ required: true, message: '请输入库存' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入库存" />
          </Form.Item>
          <Form.Item name="image" label="商品图片">
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          <Form.Item name="description" label="商品描述">
            <TextArea rows={4} placeholder="请输入商品描述" />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked" initialValue={1}>
            <Switch checkedChildren="上架" unCheckedChildren="下架" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="商品评论"
        open={commentModalVisible}
        onCancel={() => setCommentModalVisible(false)}
        footer={null}
        width={700}
      >
        {comments.length > 0 ? (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {comments.map(comment => (
              <div key={comment.id} style={{ padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><strong>{comment.user?.nickname || comment.user?.username}</strong></span>
                  <span style={{ color: '#999' }}>{dayjs(comment.created_at).format('YYYY-MM-DD HH:mm')}</span>
                </div>
                <p style={{ margin: '8px 0' }}>{comment.content}</p>
                <div style={{ textAlign: 'right' }}>
                  <Popconfirm
                    title="确定要删除该评论吗？"
                    onConfirm={() => handleDeleteComment(comment.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button type="text" danger size="small">删除</Button>
                  </Popconfirm>
                </div>
              </div>
            ))}
          </Space>
        ) : (
          <div style={{ textAlign: 'center', padding: 40 }}>暂无评论</div>
        )}
      </Modal>
    </div>
  )
}

export default ProductManagement
