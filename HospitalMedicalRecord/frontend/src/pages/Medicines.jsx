import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Form, Input, Select, Modal, Tag, message, Popconfirm, Space, Upload, InputNumber, Image } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons'
import request from '../utils/request'

const statusOptions = [
  { value: 1, label: '可用' },
  { value: 0, label: '停用' },
]

const Medicines = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchForm] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()
  const [imageUrl, setImageUrl] = useState('')

  const fetchData = async (page = 1, pageSize = 10, params = {}) => {
    setLoading(true)
    try {
      const res = await request.get('/medicines', {
        params: {
          page,
          page_size: pageSize,
          ...params,
        },
      })
      setData(res.data.data)
      setPagination({
        current: page,
        pageSize,
        total: res.data.total,
      })
    } catch (error) {
      console.error('Fetch medicines error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSearch = (values) => {
    fetchData(1, pagination.pageSize, values)
  }

  const handleReset = () => {
    searchForm.resetFields()
    fetchData(1, pagination.pageSize)
  }

  const handleTableChange = (pagination) => {
    const values = searchForm.getFieldsValue()
    fetchData(pagination.current, pagination.pageSize, values)
  }

  const handleAdd = () => {
    setEditingId(null)
    setModalTitle('新增药品')
    form.resetFields()
    form.setFieldsValue({ status: 1 })
    setImageUrl('')
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
    setModalTitle('编辑药品')
    form.setFieldsValue(record)
    setImageUrl(record.image_url || '')
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await request.delete(`/medicines/${id}`)
      message.success('删除成功')
      fetchData(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Delete medicine error:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      const submitData = {
        ...values,
        image_url: imageUrl,
      }
      
      if (editingId) {
        await request.put(`/medicines/${editingId}`, submitData)
        message.success('更新成功')
      } else {
        await request.post('/medicines', submitData)
        message.success('创建成功')
      }
      
      setModalVisible(false)
      fetchData(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Submit medicine error:', error)
    }
  }

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const token = localStorage.getItem('token')
      const response = await fetch('/api/medicines/upload-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      
      const result = await response.json()
      
      if (result.code === 200) {
        setImageUrl(result.data.url)
        onSuccess(result.data)
        message.success('上传成功')
      } else {
        onError(result.message)
        message.error(result.message || '上传失败')
      }
    } catch (error) {
      onError(error)
      message.error('上传失败')
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '药品图片',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 100,
      render: (imageUrl) => (
        imageUrl ? (
          <Image
            width={60}
            height={60}
            src={imageUrl}
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          <span style={{ color: '#999' }}>-</span>
        )
      ),
    },
    {
      title: '药品编号',
      dataIndex: 'medicine_no',
      key: 'medicine_no',
    },
    {
      title: '药品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '通用名',
      dataIndex: 'generic_name',
      key: 'generic_name',
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
    },
    {
      title: '剂型',
      dataIndex: 'dosage_form',
      key: 'dosage_form',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `¥${price}`,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '可用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个药品吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const uploadProps = {
    customRequest: handleUpload,
    showUploadList: false,
    accept: 'image/*',
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">药品管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增药品
        </Button>
      </div>

      <Card>
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          className="search-form"
        >
          <Form.Item name="keyword" label="关键字">
            <Input placeholder="药品编号/名称/通用名/厂家" />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Input placeholder="请输入分类" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="全部" style={{ width: 100 }} allowClear>
              {statusOptions.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
              搜索
            </Button>
          </Form.Item>
          <Form.Item>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        destroyOnClose
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="medicine_no"
            label="药品编号"
            rules={[{ required: true, message: '请输入药品编号' }]}
          >
            <Input placeholder="请输入药品编号" />
          </Form.Item>
          
          <Form.Item
            name="name"
            label="药品名称"
            rules={[{ required: true, message: '请输入药品名称' }]}
          >
            <Input placeholder="请输入药品名称" />
          </Form.Item>
          
          <Form.Item name="generic_name" label="通用名">
            <Input placeholder="请输入通用名" />
          </Form.Item>
          
          <Form.Item name="manufacturer" label="生产厂家">
            <Input placeholder="请输入生产厂家" />
          </Form.Item>
          
          <Form.Item name="specification" label="规格">
            <Input placeholder="请输入规格" />
          </Form.Item>
          
          <Form.Item name="dosage_form" label="剂型">
            <Input placeholder="请输入剂型" />
          </Form.Item>
          
          <Form.Item name="category" label="药品分类">
            <Input placeholder="请输入药品分类" />
          </Form.Item>
          
          <Form.Item name="unit" label="单位">
            <Input placeholder="请输入单位" />
          </Form.Item>
          
          <Form.Item name="price" label="价格">
            <InputNumber
              placeholder="请输入价格"
              style={{ width: '100%' }}
              min={0}
              precision={2}
              addonBefore="¥"
            />
          </Form.Item>
          
          <Form.Item name="stock" label="库存数量">
            <InputNumber
              placeholder="请输入库存数量"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
          
          <Form.Item name="description" label="药品说明">
            <Input.TextArea placeholder="请输入药品说明" rows={3} />
          </Form.Item>
          
          <Form.Item label="药品图片">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>上传图片</Button>
              </Upload>
              {imageUrl && (
                <Image
                  width={80}
                  height={80}
                  src={imageUrl}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
              )}
              {imageUrl && (
                <Button
                  type="link"
                  danger
                  onClick={() => {
                    setImageUrl('')
                  }}
                >
                  移除
                </Button>
              )}
            </div>
          </Form.Item>
          
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态">
              {statusOptions.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Medicines
