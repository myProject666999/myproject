import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button,
  Space,
  Typography,
  Card,
  Form,
  Select,
  Input,
  DatePicker,
  Table,
  Tag,
  Modal,
  message,
  Tooltip,
  Popconfirm,
  Avatar,
  AutoComplete,
  Spin,
} from 'antd'
import {
  ArrowLeftOutlined,
  LinkOutlined,
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { permissionsApi } from '@/api/permissions'
import type { Permission, ShareLink, User } from '@/types'

const { Title, Text } = Typography

export default function ShareSettings() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([])
  const [loading, setLoading] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [inviteForm] = Form.useForm()
  const [shareForm] = Form.useForm()

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const [perms, links] = await Promise.all([
        permissionsApi.getPermissions(id) as unknown as Permission[],
        permissionsApi.getShareLinks(id) as unknown as ShareLink[],
      ])
      setPermissions(perms)
      setShareLinks(links)
    } catch {
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchUsers = async (query: string) => {
    if (!query) {
      setSearchResults([])
      return
    }
    setSearchLoading(true)
    try {
      const users = await permissionsApi.searchUsers(query) as unknown as User[]
      setSearchResults(users)
    } catch {
      message.error('搜索用户失败')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!id) return
    try {
      const values = await inviteForm.validateFields()
      await permissionsApi.addPermission(id, {
        userId: values.userId,
        permissionLevel: values.permissionLevel,
      })
      message.success('邀请成功')
      setInviteModalOpen(false)
      inviteForm.resetFields()
      fetchData()
    } catch (err) {
      if (err !== false) {
        message.error('邀请失败')
      }
    }
  }

  const handleUpdatePermission = async (permissionId: string, level: Permission['permissionLevel']) => {
    if (!id) return
    try {
      await permissionsApi.updatePermission(id, permissionId, { permissionLevel: level })
      message.success('权限已更新')
      fetchData()
    } catch {
      message.error('更新失败')
    }
  }

  const handleRemovePermission = async (permissionId: string) => {
    if (!id) return
    try {
      await permissionsApi.removePermission(id, permissionId)
      message.success('已移除协作者')
      fetchData()
    } catch {
      message.error('移除失败')
    }
  }

  const handleCreateShareLink = async () => {
    if (!id) return
    try {
      const values = await shareForm.validateFields()
      const data: { permissionLevel: 'read' | 'write'; expiresAt?: string } = {
        permissionLevel: values.permissionLevel,
      }
      if (values.expireAt) {
        data.expiresAt = values.expireAt.format('YYYY-MM-DD')
      }
      await permissionsApi.createShareLink(id, data) as unknown as ShareLink
      message.success('分享链接已生成')
      setShareModalOpen(false)
      shareForm.resetFields()
      fetchData()
    } catch (err) {
      if (err !== false) {
        message.error('生成链接失败')
      }
    }
  }

  const handleDeleteShareLink = async (shareId: string) => {
    if (!id) return
    try {
      await permissionsApi.deleteShareLink(id, shareId)
      message.success('分享链接已删除')
      fetchData()
    } catch {
      message.error('删除失败')
    }
  }

  const permissionColumns = [
    {
      title: '用户',
      dataIndex: 'userId',
      key: 'userId',
      render: (_: string, record: Permission) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>{record.userId}</Text>
        </Space>
      ),
    },
    {
      title: '权限',
      dataIndex: 'permissionLevel',
      key: 'permissionLevel',
      render: (level: string, record: Permission) => (
        <Select
          value={level as Permission['permissionLevel']}
          size="small"
          style={{ width: 100 }}
          onChange={(value) => handleUpdatePermission(record.id, value as Permission['permissionLevel'])}
          options={[
            { value: 'read', label: '只读' },
            { value: 'write', label: '可编辑' },
            { value: 'admin', label: '管理员' },
          ]}
        />
      ),
    },
    {
      title: '添加时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Permission) => (
        <Popconfirm
          title="确定移除此协作者？"
          onConfirm={() => handleRemovePermission(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger size="small" icon={<DeleteOutlined />}>
            移除
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          />
          <Title level={4} style={{ margin: 0 }}>
            <TeamOutlined style={{ marginRight: 8 }} />
            分享与权限设置
          </Title>
        </Space>
      </div>

      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Card title="协作者" extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setInviteModalOpen(true)}
          >
            邀请协作者
          </Button>
        }>
          <Table
            rowKey="id"
            columns={permissionColumns}
            dataSource={permissions}
            loading={loading}
            pagination={false}
          />
        </Card>

        <Card title="分享链接" extra={
          <Button
            type="primary"
            icon={<LinkOutlined />}
            onClick={() => setShareModalOpen(true)}
          >
            创建分享链接
          </Button>
        }>
          {shareLinks.length === 0 ? (
            <Text type="secondary">暂无分享链接</Text>
          ) : (
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              {shareLinks.map((link) => (
                <div
                  key={link.id}
                  style={{
                    padding: 12,
                    background: '#fafafa',
                    borderRadius: 8,
                  }}
                >
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <Space>
                      <Tag color={link.permissionLevel === 'write' ? 'blue' : 'green'}>
                        {link.permissionLevel === 'write' ? '可编辑' : '只读'}
                      </Tag>
                      {link.expiresAt && (
                        <Tag color="orange">
                          有效期至 {dayjs(link.expiresAt).format('YYYY-MM-DD')}
                        </Tag>
                      )}
                    </Space>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Input
                        value={`${window.location.origin}/share/${link.token}`}
                        readOnly
                        size="small"
                      />
                      <Tooltip title="复制链接">
                        <Button
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}/share/${link.token}`
                            )
                            message.success('链接已复制')
                          }}
                        />
                      </Tooltip>
                      <Popconfirm
                        title="确定删除此分享链接？"
                        onConfirm={() => handleDeleteShareLink(link.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </div>
                  </Space>
                </div>
              ))}
            </Space>
          )}
        </Card>
      </Space>

      <Modal
        title="邀请协作者"
        open={inviteModalOpen}
        onOk={handleInvite}
        onCancel={() => {
          setInviteModalOpen(false)
          inviteForm.resetFields()
        }}
        okText="邀请"
        cancelText="取消"
      >
        <Form form={inviteForm} layout="vertical">
          <Form.Item
            name="userId"
            label="用户"
            rules={[{ required: true, message: '请选择用户' }]}
          >
            <Spin spinning={searchLoading}>
              <AutoComplete
                placeholder="搜索用户..."
                onSearch={handleSearchUsers}
                options={searchResults.map((u) => ({
                  value: u.id,
                  label: (
                    <Space>
                      <Avatar size="small" icon={<UserOutlined />} />
                      {u.username}
                    </Space>
                  ),
                }))}
              />
            </Spin>
          </Form.Item>
          <Form.Item
            name="permissionLevel"
            label="权限"
            rules={[{ required: true, message: '请选择权限' }]}
            initialValue="read"
          >
            <Select
              options={[
                { value: 'read', label: '只读 - 可以查看文档' },
                { value: 'write', label: '可编辑 - 可以编辑文档' },
                { value: 'admin', label: '管理员 - 可以管理权限' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="创建分享链接"
        open={shareModalOpen}
        onOk={handleCreateShareLink}
        onCancel={() => {
          setShareModalOpen(false)
          shareForm.resetFields()
        }}
        okText="创建"
        cancelText="取消"
      >
        <Form form={shareForm} layout="vertical">
          <Form.Item
            name="permissionLevel"
            label="权限"
            rules={[{ required: true, message: '请选择权限' }]}
            initialValue="read"
          >
            <Select
              options={[
                { value: 'read', label: '只读' },
                { value: 'write', label: '可编辑' },
              ]}
            />
          </Form.Item>
          <Form.Item name="expireAt" label="有效期">
            <DatePicker style={{ width: '100%' }} placeholder="选择过期日期" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
