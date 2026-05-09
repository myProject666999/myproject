import { Layout, Menu, Avatar, Dropdown, Button } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  ShopOutlined,
  CalendarOutlined,
  BookOutlined,
  MessageOutlined,
  LogoutOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/admin/users', icon: <UserOutlined />, label: '管理员管理' },
  { key: '/admin/students', icon: <TeamOutlined />, label: '学生管理' },
  { key: '/admin/services', icon: <ShopOutlined />, label: '服务管理' },
  { key: '/admin/appointments', icon: <CalendarOutlined />, label: '预约管理' },
  { key: '/admin/knowledge', icon: <BookOutlined />, label: '知识管理' },
  { key: '/admin/messages', icon: <MessageOutlined />, label: '留言管理' }
]

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/admin/login')
  }

  const userItems = [
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout }
  ]

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <Layout className="admin-layout" style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={220}>
        <div className="logo">学业规划系统</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <h3 style={{ margin: 0 }}>后台管理系统</h3>
          <Dropdown menu={{ items: userItems }}>
            <Button type="text" style={{ padding: '4px 16px' }}>
              <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
              {user.real_name || user.username}
            </Button>
          </Dropdown>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
