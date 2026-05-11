import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, message, Popconfirm, Typography, Image } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { adminApi } from '../../utils/api'
import dayjs from 'dayjs'

const { Title } = Typography

function BannerManagement() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getBanners()
      setBanners(res.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingBanner(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (banner) => {
    setEditingBanner(banner)
    form.setFieldsValue(banner)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteBanner(id)
      message.success('删除成功')
      loadBanners()
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (values) => {
    try {
      if (editingBanner) {
        await adminApi.updateBanner(editingBanner.id, values)
      } else {
        await adminApi.createBanner(values)
      }
      message.success(editingBanner ? '更新成功' : '添加成功')
      setModalVisible(false)
      loadBanners()
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
      title: '图片',
      dataIndex: 'image',
      key: 'image',
      width: 120,
      render: (image) => (
        <Image src={image} width={100} height={50} style={{ objectFit: 'cover' }} />
      )
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '链接',
      dataIndex: 'link',
      key: 'link',
      ellipsis: true
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (status === 1 ? '启用' : '禁用')
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm
            title="确定要删除该轮播图吗？"
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
      <Title level={2} style={{ marginBottom: 24 }}>轮播图管理</Title>
      
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加轮播图
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={banners}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingBanner ? '编辑轮播图' : '添加轮播图'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入轮播图标题" />
          </Form.Item>
          <Form.Item name="image" label="图片URL" rules={[{ required: true, message: '请输入图片URL' }]}>
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          <Form.Item name="link" label="跳转链接">
            <Input placeholder="请输入跳转链接" />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked" initialValue={1}>
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BannerManagement
