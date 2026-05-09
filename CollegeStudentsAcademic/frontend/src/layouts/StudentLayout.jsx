import { Layout, Menu, Button, Avatar, Dropdown } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  HomeOutlined,
  ShopOutlined,
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
  MessageOutlined,
  LogoutOutlined,
  LoginOutlined
} from '@ant-design/icons'

const { Header, Content, Footer } = Layout

function StudentLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isLoggedIn = localStorage.getItem('token') && user.role === 'student'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/home')
  }

  const userItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心', onClick: () => navigate('/profile') },
    { key: 'appointments', icon: <CalendarOutlined />, label: '我的预约', onClick: () => navigate('/appointments') },
    { key: 'messages', icon: <MessageOutlined />, label: '我的留言', onClick: () => navigate('/messages') },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout }
  ]

  const menuItems = [
    { key: '/home', icon: <HomeOutlined />, label: '首页' },
    { key: '/services', icon: <ShopOutlined />, label: '服务信息' },
    { key: '/knowledge', icon: <BookOutlined />, label: '学业规划知识' },
  ]

  return (
    <Layout className="student-layout" style={{ minHeight: '100vh' }}>
      <Header className="header" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="logo-text" style={{ marginRight: 32 }}>学业规划咨询平台</span>
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={({ key }) => navigate(key)}
              style={{ minWidth: 400 }}
            />
          </div>
          <div>
            {isLoggedIn ? (
              <Dropdown menu={{ items: userItems }}>
                <Button type="text" style={{ padding: '4px 16px' }}>
                  <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                  {user.real_name}
                </Button>
              </Dropdown>
            ) : (
              <div>
                <Button type="link" onClick={() => navigate('/login')} icon={<LoginOutlined />}>
                  登录
                </Button>
                <Button type="primary" onClick={() => navigate('/register')} style={{ marginLeft: 8 }}>
                  注册
                </Button>
              </div>
            )}
          </div>
        </div>
      </Header>
      <Content>
        <Outlet />
      </Content>
      <Footer className="footer">
        © 2026 大学生学业规划咨询服务平台 版权所有
      </Footer>
    </Layout>
  )
}

export default StudentLayout
