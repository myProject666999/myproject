import { Card, Table, Button, Modal, Form, Input, Select, InputNumber, message } from 'antd'
import { useState, useEffect } from 'react'
import { API } from '../../services/api'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const res = await API.getUsers()
      setUsers(res.data)
    } catch (e) {}
  }

  const handleEdit = record => {
    setEditingUser(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const onFinish = async values => {
    try {
      await API.updateUser(editingUser.id, values)
      message.success('更新成功')
      setModalVisible(false)
      loadUsers()
    } catch (e) {}
  }

  const memberLevelOptions = [
    { value: 1, label: '普通会员' },
    { value: 2, label: '银卡会员' },
    { value: 3, label: '金卡会员' },
    { value: 4, label: '钻石会员' }
  ]

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '真实姓名', dataIndex: 'realName', key: 'realName' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '会员等级', dataIndex: 'memberLevel', key: 'memberLevel', render: v => memberLevelOptions.find(o => o.value === v)?.label },
    { title: '积分', dataIndex: 'memberPoints', key: 'memberPoints' },
    { title: '状态', dataIndex: 'status', key: 'status', render: v => v ? '正常' : '禁用' },
    { title: '操作', key: 'action', render: (_, record) => (
      <Button size="small" onClick={() => handleEdit(record)}>编辑</Button>
    ) }
  ]

  return (
    <div>
      <h2>用户管理</h2>
      <Card>
        <Table columns={columns} dataSource={users} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title="编辑用户" open={modalVisible} onCancel={() => setModalVisible(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="realName" label="真实姓名">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="memberLevel" label="会员等级">
            <Select options={memberLevelOptions} />
          </Form.Item>
          <Form.Item name="memberPoints" label="积分">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Select.Option value={1}>正常</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
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

export default UserManagement
