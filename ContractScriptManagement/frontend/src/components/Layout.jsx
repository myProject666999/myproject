import { Layout, Menu, Dropdown, Avatar, Button } from 'antd'
import { HomeOutlined, BookOutlined, MessageOutlined, InfoCircleOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const { Header, Content, Footer } = Layout

function WebLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAdmin } = useAuth()

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
    { key: '/scripts', icon: <BookOutlined />, label: <Link to="/scripts">剧本</Link> },
    { key: '/discussions', icon: <MessageOutlined />, label: <Link to="/discussions">剧本讨论</Link> },
    { key: '/news', icon: <InfoCircleOutlined />, label: <Link to="/news">剧本资讯</Link> }
  ]

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: <Link to="/profile">个人中心</Link> },
      ...(isAdmin() ? [{ key: 'admin', icon: <SettingOutlined />, label: <Link to="/admin">后台管理</Link> }] : []),
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: () => { logout(); navigate('/') } }
    ]
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', padding: '0 50px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff', marginRight: '40px' }}>
          🎭 有约剧本杀
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname.split('/')[1] ? '/' + location.pathname.split('/')[1] : '/']}
          items={menuItems}
          style={{ flex: 1, borderBottom: 'none' }}
        />
        {user ? (
          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} src={user.avatar} />
              <span style={{ marginLeft: 8 }}>{user.nickname || user.username}</span>
            </div>
          </Dropdown>
        ) : (
          <div>
            <Button type="link" onClick={() => navigate('/login')}>登录</Button>
            <Button type="primary" onClick={() => navigate('/register')}>注册</Button>
          </div>
        )}
      </Header>
      <Content style={{ padding: '24px 50px' }}>
        {children}
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        有约剧本杀管理系统 ©2024 Created with React + Go
      </Footer>
    </Layout>
  )
}

export default WebLayout
