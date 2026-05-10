import { useEffect, useState } from 'react'
import { Card, Form, Input, Button, Tabs, Table, Avatar, Typography, Tag, message, Modal } from 'antd'
import { UserOutlined, ShoppingOutlined, MessageOutlined, EditOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authApi, orderApi, discussionApi } from '../services/api'
import WebLayout from '../components/Layout'

const { Title } = Typography
const { TabPane } = Tabs

function Profile() {
  const { user, fetchUser } = useAuth()
  const [form] = Form.useForm()
  const [orders, setOrders] = useState([])
  const [discussions, setDiscussions] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    form.setFieldsValue({
      nickname: user.nickname,
      email: user.email,
      phone: user.phone
    })
    loadOrders()
    loadDiscussions()
  }, [user])

  const loadOrders = async () => {
    const res = await orderApi.myList({ page: 1, page_size: 100 })
    setOrders(res.data?.list || [])
  }

  const loadDiscussions = async () => {
    const res = await discussionApi.myList({ page: 1, page_size: 100 })
    setDiscussions(res.data?.list || [])
  }

  const handleUpdate = async (values) => {
    try {
      await authApi.updateProfile(values)
      await fetchUser()
      message.success('更新成功')
    } catch (err) {
      // Error handled
    }
  }

  const orderColumns = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no' },
    { title: '剧本', dataIndex: ['script', 'title'], key: 'script_title' },
    { title: '房间', dataIndex: ['room', 'name'], key: 'room_name' },
    { title: '日期', dataIndex: 'play_date', key: 'play_date' },
    { title: '时间', dataIndex: 'play_time', key: 'play_time' },
    { title: '人数', dataIndex: 'players', key: 'players' },
    { title: '金额', dataIndex: 'total_amount', key: 'total_amount', render: v => `¥${v}` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const map = {
          0: { color: 'orange', text: '待审核' },
          1: { color: 'green', text: '已通过' },
          2: { color: 'red', text: '已拒绝' }
        }
        const item = map[status] || { color: 'default', text: '未知' }
        return <Tag color={item.color}>{item.text}</Tag>
      }
    }
  ]

  const discussionColumns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '关联剧本', dataIndex: ['script', 'title'], key: 'script_title', render: v => v || '-' },
    { title: '浏览', dataIndex: 'views', key: 'views' },
    { title: '发布时间', dataIndex: 'created_at', key: 'created_at', render: v => new Date(v).toLocaleDateString() }
  ]

  if (!user) return null

  return (
    <WebLayout>
      <Title level={2}>个人中心</Title>

      <Tabs defaultActiveKey="1">
        <TabPane tab={<span><UserOutlined /> 个人信息</span>} key="1">
          <Card style={{ maxWidth: 600 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar size={80} icon={<UserOutlined />} src={user.avatar} />
              <Title level={4} style={{ marginTop: 16 }}>
                {user.nickname || user.username}
              </Title>
              <Tag color={user.role === 'admin' ? 'blue' : 'green'}>
                {user.role === 'admin' ? '管理员' : '普通用户'}
              </Tag>
            </div>
            <Form form={form} layout="vertical" onFinish={handleUpdate}>
              <Form.Item name="nickname" label="昵称">
                <Input />
              </Form.Item>
              <Form.Item name="email" label="邮箱">
                <Input />
              </Form.Item>
              <Form.Item name="phone" label="手机号">
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<EditOutlined />}>
                  修改信息
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<span><ShoppingOutlined /> 我的订单</span>} key="2">
          <Card>
            <Table
              columns={orderColumns}
              dataSource={orders}
              rowKey="id"
              pagination={false}
            />
            {orders.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                暂无订单，快去预约剧本吧！
              </div>
            )}
          </Card>
        </TabPane>

        <TabPane tab={<span><MessageOutlined /> 我的发布</span>} key="3">
          <Card>
            <Table
              columns={discussionColumns}
              dataSource={discussions}
              rowKey="id"
              pagination={false}
              onRow={(record) => ({
                onClick: () => navigate(`/discussions/${record.id}`),
                style: { cursor: 'pointer' }
              })}
            />
            {discussions.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                暂无发布，去讨论区分享你的体验吧！
              </div>
            )}
          </Card>
        </TabPane>
      </Tabs>
    </WebLayout>
  )
}

export default Profile
