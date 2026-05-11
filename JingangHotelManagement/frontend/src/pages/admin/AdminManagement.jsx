import { Card, Table, Button, Modal, Form, Input, Select, message, Popconfirm } from 'antd'
import { useState, useEffect } from 'react'
import { API } from '../../services/api'

const AdminManagement = () => {
  const [admins, setAdmins] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    try {
      const res = await API.getAdmins()
      setAdmins(res.data)
    } catch (e) {}
  }

  const handleAdd = () => {
    setEditingAdmin(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = record => {
    setEditingAdmin(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async id => {
    try {
      await API.deleteAdmin(id)
      message.success('删除成功')
      loadAdmins()
    } catch (e) {}
  }

  const onFinish = async values => {
    try {
      if (editingAdmin) {
        await API.updateAdmin(editingAdmin.id, values)
        message.success('更新成功')
      } else {
        await API.createAdmin(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadAdmins()
    } catch (e) {}
  }

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '真实姓名', dataIndex: 'realName', key: 'realName' },
    { title: '是否超级管理员', dataIndex: 'isSuper', key: 'isSuper', render: v => v ? '是' : '否' },
    { title: '状态', dataIndex: 'status', key: 'status', render: v => v ? '启用' : '禁用' },
    { title: '操作', key: 'action', render: (_, record) => (
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="small" onClick={() => handleEdit(record)} disabled={record.isSuper === 1}>编辑</Button>
        <Popconfirm title="确认删除" onConfirm={() => handleDelete(record.id)}>
          <Button size="small" danger disabled={record.isSuper === 1}>删除</Button>
        </Popconfirm>
      </div>
    ) }
  ]

  return (
    <div>
      <h2>管理员管理</h2>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={handleAdd}>添加管理员</Button>
        </div>
        <Table columns={columns} dataSource={admins} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title={editingAdmin ? '编辑管理员' : '添加管理员'} open={modalVisible} onCancel={() => setModalVisible(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {!editingAdmin && (
            <>
              <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="password" label="密码" rules={[{ required: true }]}>
                <Input.Password />
              </Form.Item>
            </>
          )}
          <Form.Item name="realName" label="真实姓名">
            <Input />
          </Form.Item>
          {!editingAdmin && (
            <Form.Item name="isSuper" label="是否超级管理员" initialValue={0}>
              <Select>
                <Select.Option value={0}>否</Select.Option>
                <Select.Option value={1}>是</Select.Option>
              </Select>
            </Form.Item>
          )}
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select>
              <Select.Option value={1}>启用</Select.Option>
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

export default AdminManagement
