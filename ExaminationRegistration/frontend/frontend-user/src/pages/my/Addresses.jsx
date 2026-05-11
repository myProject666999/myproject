import React, { useEffect, useState } from 'react'
import { List, Card, Typography, Button, Modal, Form, Input, message, Empty } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons'
import { getAddressList, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../../utils/api'

const { Title } = Typography

const Addresses = () => {
  const [list, setList] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await getAddressList()
      setList(res.data || [])
    } catch (error) {
      console.error('Load data error:', error)
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    form.setFieldsValue(item)
    setModalVisible(true)
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该地址吗？',
      onOk: async () => {
        try {
          await deleteAddress(id)
          message.success('删除成功')
          loadData()
        } catch (error) {
          console.error('Delete error:', error)
        }
      }
    })
  }

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id)
      message.success('设置成功')
      loadData()
    } catch (error) {
      console.error('Set default error:', error)
    }
  }

  const onFinish = async (values) => {
    try {
      if (editingItem) {
        await updateAddress(editingItem.id, values)
        message.success('更新成功')
      } else {
        await createAddress(values)
        message.success('添加成功')
      }
      setModalVisible(false)
      loadData()
    } catch (error) {
      console.error('Save error:', error)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>我的地址</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加地址
        </Button>
      </div>
      
      <Card>
        {list.length === 0 ? (
          <Empty description="暂无收货地址" />
        ) : (
          <List
            dataSource={list}
            renderItem={item => (
              <List.Item
                actions={[
                  item.is_default !== 1 && <Button type="link" icon={<CheckOutlined />} onClick={() => handleSetDefault(item.id)}>设为默认</Button>,
                  <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(item)}>编辑</Button>,
                  <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(item.id)}>删除</Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <span>
                      {item.name} {item.phone}
                      {item.is_default === 1 && <span style={{ marginLeft: 8, color: '#1890ff' }}>[默认]</span>}
                    </span>
                  }
                  description={`${item.province || ''}${item.city || ''}${item.district || ''}${item.detail || ''}`}
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        title={editingItem ? '编辑地址' : '添加地址'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="收货人"
            rules={[{ required: true, message: '请输入收货人' }]}
          >
            <Input placeholder="请输入收货人" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            name="province"
            label="省份"
            rules={[{ required: true, message: '请输入省份' }]}
          >
            <Input placeholder="请输入省份" />
          </Form.Item>
          <Form.Item
            name="city"
            label="城市"
            rules={[{ required: true, message: '请输入城市' }]}
          >
            <Input placeholder="请输入城市" />
          </Form.Item>
          <Form.Item
            name="district"
            label="区县"
            rules={[{ required: true, message: '请输入区县' }]}
          >
            <Input placeholder="请输入区县" />
          </Form.Item>
          <Form.Item
            name="detail"
            label="详细地址"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入详细地址" />
          </Form.Item>
          <Form.Item
            name="is_default"
            valuePropName="checked"
          >
            <input type="checkbox" /> 设为默认地址
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">保存</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Addresses
