import React, { useEffect, useState } from 'react'
import { Tag, Card, List, Button, Typography, Modal, Form, Input, message, Switch } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, EnvironmentOutlined } from '@ant-design/icons'
import api from '../api'

const { Title } = Typography

const MyAddresses: React.FC = () => {
  const [addresses, setAddresses] = useState<any[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    try {
      const data = await api.get('/addresses')
      setAddresses(data || [])
    } catch (error) {
      console.error('加载地址失败', error)
    }
  }

  const showModal = (address?: any) => {
    setEditingAddress(address || null)
    if (address) {
      form.setFieldsValue(address)
    } else {
      form.resetFields()
    }
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingAddress) {
        await api.put(`/addresses/${editingAddress.id}`, values)
        message.success('地址已更新')
      } else {
        await api.post('/addresses', values)
        message.success('地址已添加')
      }
      setModalVisible(false)
      loadAddresses()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除该地址？',
      onOk: async () => {
        try {
          await api.delete(`/addresses/${id}`)
          message.success('地址已删除')
          loadAddresses()
        } catch (error: any) {
          message.error(error.message || '删除失败')
        }
      }
    })
  }

  const setDefault = async (id: number, isDefault: boolean) => {
    try {
      await api.put(`/addresses/${id}`, { is_default: isDefault })
      loadAddresses()
    } catch (error: any) {
      message.error(error.message || '设置失败')
    }
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>收货地址</Title>

      <Card style={{ marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          添加地址
        </Button>
      </Card>

      <Card>
        <List
          dataSource={addresses}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" icon={<EditOutlined />} onClick={() => showModal(item)}>编辑</Button>,
                <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(item.id)}>删除</Button>
              ]}
            >
              <List.Item.Meta
                avatar={<EnvironmentOutlined style={{ fontSize: 24 }} />}
                title={
                  <span>
                    {item.name} {item.phone}
                    {item.is_default && <Tag color="blue" style={{ marginLeft: 8 }}>默认</Tag>}
                  </span>
                }
                description={`${item.province || ''} ${item.city || ''} ${item.district || ''} ${item.detail_address}`}
              />
              <Switch
                checked={item.is_default}
                onChange={(val) => setDefault(item.id, val)}
                checkedChildren="默认"
                unCheckedChildren="设置"
              />
            </List.Item>
          )}
        />

        {addresses.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48 }}>
            暂无收货地址
          </div>
        )}
      </Card>

      <Modal
        title={editingAddress ? '编辑地址' : '添加地址'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="收货人" rules={[{ required: true }]}>
            <Input placeholder="请输入收货人姓名" />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="province" label="省份">
            <Input placeholder="请输入省份" />
          </Form.Item>
          <Form.Item name="city" label="城市">
            <Input placeholder="请输入城市" />
          </Form.Item>
          <Form.Item name="district" label="区/县">
            <Input placeholder="请输入区/县" />
          </Form.Item>
          <Form.Item name="detail_address" label="详细地址" rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="请输入详细地址" />
          </Form.Item>
          <Form.Item name="is_default" label="设为默认地址" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MyAddresses
