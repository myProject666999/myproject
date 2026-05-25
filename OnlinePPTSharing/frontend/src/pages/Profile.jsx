import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Avatar,
  Row,
  Col,
  Tabs,
  Form,
  Input,
  Button,
  message,
  Empty,
  Modal,
  Statistic,
  Typography,
  Spin
} from 'antd'
import {
  UserOutlined,
  FileTextOutlined,
  LikeOutlined,
  StarOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { userApi } from '../api/user'
import { documentApi } from '../api/document'
import DocumentCard from '../components/DocumentCard'

const { Title } = Typography
const { TextArea } = Input

const Profile = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({})
  const [myDocuments, setMyDocuments] = useState([])
  const [myFavorites, setMyFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editForm] = Form.useForm()
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [passwordForm] = Form.useForm()

  useEffect(() => {
    const userInfo = localStorage.getItem('user')
    if (!userInfo) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await userApi.getProfile()
      setUser(res.data.user)
      setStats(res.data.stats)
      fetchMyDocuments()
      fetchMyFavorites()
    } catch (error) {
      console.error('获取用户信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyDocuments = async () => {
    try {
      const res = await userApi.getMyDocuments({ page: 1, limit: 50 })
      setMyDocuments(res.data.list)
    } catch (error) {
      console.error('获取我的文档失败:', error)
    }
  }

  const fetchMyFavorites = async () => {
    try {
      const res = await userApi.getMyFavorites({ page: 1, limit: 50 })
      setMyFavorites(res.data.list)
    } catch (error) {
      console.error('获取收藏失败:', error)
    }
  }

  const handleEditProfile = async () => {
    try {
      const values = await editForm.validateFields()
      await userApi.updateProfile(values)
      message.success('更新成功')
      setEditModalVisible(false)
      fetchProfile()
      const userInfo = localStorage.getItem('user')
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo)
        localStorage.setItem(
          'user',
          JSON.stringify({ ...parsedUser, ...values })
        )
      }
    } catch (error) {
      message.error('更新失败')
    }
  }

  const handleChangePassword = async () => {
    passwordForm.validateFields().then(async (values) => {
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致')
        return
      }
      await userApi.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      })
      message.success('密码修改成功')
      setPasswordModalVisible(false)
      passwordForm.resetFields()
    }).catch(() => {})
  }

  const handleDeleteDocument = (doc) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除文档 "${doc.title}" 吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          await documentApi.delete(doc.id)
          message.success('删除成功')
          fetchMyDocuments()
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (!user) {
    return <Empty description="用户不存在" style={{ marginTop: 100 }} />
  }

  const tabItems = [
    {
      key: 'info',
      label: '个人信息',
      children: (
        <Card>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <Avatar
                  size={120}
                  src={user.avatar}
                  icon={!user.avatar && <UserOutlined />}
                  style={{ marginBottom: 16 }}
                />
                <Title level={4} style={{ marginBottom: 8 }}>
                  {user.nickname || user.username}
                </Title>
                <div style={{ color: '#999', marginBottom: 16 }}>
                  @{user.username}
                </div>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    editForm.setFieldsValue({
                      nickname: user.nickname,
                      email: user.email,
                      bio: user.bio,
                      avatar: user.avatar
                    })
                    setEditModalVisible(true)
                  }}
                >
                  编辑资料
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  onClick={() => setPasswordModalVisible(true)}
                >
                  修改密码
                </Button>
              </div>
            </Col>
            <Col xs={24} sm={16}>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="上传文档"
                      value={stats.document_count || 0}
                      prefix={<FileTextOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="获得点赞"
                      value={stats.like_count || 0}
                      prefix={<LikeOutlined />}
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="收藏数量"
                      value={stats.favorite_count || 0}
                      prefix={<StarOutlined />}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Card>
                </Col>
              </Row>
              {user.bio && (
                <Card title="个人简介" style={{ marginTop: 16 }}>
                  {user.bio}
                </Card>
              )}
            </Col>
          </Row>
        </Card>
      )
    },
    {
      key: 'documents',
      label: '我的文档',
      children: (
        <Card>
          {myDocuments.length > 0 ? (
            <Row gutter={[16, 16]}>
              {myDocuments.map((doc) => (
                <Col key={doc.id} xs={24} sm={12} md={8} lg={6}>
                  <div style={{ position: 'relative' }}>
                    <DocumentCard document={doc} />
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        gap: 4
                      }}
                    >
                      <Button
                        size="small"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteDocument(doc)}
                      />
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="暂无上传的文档" style={{ marginTop: 40 }} />
          )}
        </Card>
      )
    },
    {
      key: 'favorites',
      label: '我的收藏',
      children: (
        <Card>
          {myFavorites.length > 0 ? (
            <Row gutter={[16, 16]}>
              {myFavorites.map((doc) => (
                <Col key={doc.id} xs={24} sm={12} md={8} lg={6}>
                  <DocumentCard document={doc} />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="暂无收藏的文档" style={{ marginTop: 40 }} />
          )}
        </Card>
      )
    }
  ]

  return (
    <div className="container page-container">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
      />

      <Modal
        title="编辑资料"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditProfile}
        okText="保存"
        cancelText="取消"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="nickname" label="昵称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="avatar" label="头像URL">
            <Input placeholder="输入头像图片链接" />
          </Form.Item>
          <Form.Item name="bio" label="个人简介">
            <TextArea rows={3} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        onOk={handleChangePassword}
        okText="确认修改"
        cancelText="取消"
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            name="oldPassword"
            label="原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                }
              })
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Profile
