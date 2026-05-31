import React, { useEffect, useState } from 'react'
import { Card, Table, Button, Tag, Space, Modal, Form, Input, message, Typography, Popconfirm, Select, Avatar } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons'
import { teamApi, userApi } from '../api'

const { Title, Text } = Typography
const { Option } = Select

export default function Teams() {
  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [memberModal, setMemberModal] = useState(false)
  const [currentTeam, setCurrentTeam] = useState(null)
  const [editingTeam, setEditingTeam] = useState(null)
  const [form] = Form.useForm()
  const [memberForm] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [teamsRes, usersRes] = await Promise.all([
        teamApi.getAll(),
        userApi.getAll()
      ])
      setTeams(teamsRes.data || [])
      setUsers(usersRes.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async (teamId) => {
    try {
      const res = await teamApi.getMembers(teamId)
      setMembers(res.data || [])
    } catch (error) {
      console.error(error)
    }
  }

  const handleAdd = () => {
    setEditingTeam(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingTeam(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    message.info('团队暂不支持删除，请联系管理员')
  }

  const handleSubmit = async (values) => {
    try {
      if (editingTeam) {
        await teamApi.update(editingTeam.id, values)
        message.success('更新成功')
      } else {
        await teamApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (error) {
      message.error(error.message || '操作失败')
    }
  }

  const handleViewMembers = (team) => {
    setCurrentTeam(team)
    loadMembers(team.id)
    setMemberModal(true)
  }

  const handleAddMember = async (values) => {
    try {
      await teamApi.addMember(currentTeam.id, values.userId)
      message.success('添加成功')
      memberForm.resetFields()
      loadMembers(currentTeam.id)
    } catch (error) {
      message.error(error.message || '添加失败')
    }
  }

  const handleRemoveMember = async (userId) => {
    try {
      await teamApi.removeMember(currentTeam.id, userId)
      message.success('移除成功')
      loadMembers(currentTeam.id)
    } catch (error) {
      message.error(error.message || '移除失败')
    }
  }

  const getLeaderName = (leaderId) => {
    const leader = users.find(u => u.id === leaderId)
    return leader?.realName || leader?.username || `#${leaderId}`
  }

  const columns = [
    {
      title: '团队名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '负责人',
      dataIndex: 'leaderId',
      key: 'leaderId',
      render: (id) => getLeaderName(id)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'default'}>
          {status === 'ACTIVE' ? '活跃' : '已解散'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<TeamOutlined />} onClick={() => handleViewMembers(record)}>
            成员
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
        </Space>
      )
    }
  ]

  const memberColumns = [
    {
      title: '成员',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div><Text strong>{record.realName}</Text></div>
            <div><Text type="secondary">{record.username}</Text></div>
          </div>
        </Space>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'ADMIN' ? 'purple' : 'blue'}>
          {role === 'ADMIN' ? '管理员' : '普通成员'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Popconfirm title="确定移除该成员?" onConfirm={() => handleRemoveMember(record.id)}>
          <Button type="link" danger>移除</Button>
        </Popconfirm>
      )
    }
  ]

  return (
    <div>
      <Title level={4} className="page-title">团队管理</Title>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建团队
          </Button>
        </div>

        <Table
          rowKey="id"
          dataSource={teams}
          columns={columns}
          loading={loading}
        />
      </Card>

      <Modal
        title={editingTeam ? '编辑团队' : '新建团队'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="团队名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入团队名称" />
          </Form.Item>
          <Form.Item name="description" label="团队描述">
            <Input.TextArea rows={3} placeholder="请输入团队描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${currentTeam?.name} - 成员管理`}
        open={memberModal}
        onCancel={() => setMemberModal(false)}
        width={700}
        footer={
          <Form form={memberForm} layout="inline" onFinish={handleAddMember}>
            <Form.Item name="userId" rules={[{ required: true, message: '请选择成员' }]}>
              <Select
                style={{ width: 200 }}
                placeholder="选择成员"
                showSearch
                optionFilterProp="children"
              >
                {users.filter(u => !members.find(m => m.id === u.id)).map(user => (
                  <Option key={user.id} value={user.id}>
                    {user.realName} ({user.username})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" icon={<UserAddOutlined />} htmlType="submit">
                添加成员
              </Button>
            </Form.Item>
          </Form>
        }
      >
        <Table
          rowKey="id"
          dataSource={members}
          columns={memberColumns}
          pagination={false}
        />
      </Modal>
    </div>
  )
}
