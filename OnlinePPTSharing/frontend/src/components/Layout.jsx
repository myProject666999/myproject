import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, Space } from 'antd'
import {
  HomeOutlined,
  UploadOutlined,
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { useState, useEffect } from 'react'

const { Header, Content, Footer } = AntLayout

const Layout = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userInfo = localStorage.getItem('user')
    if (userInfo) {
      setUser(JSON.parse(userInfo))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人中心',
        onClick: () => navigate('/profile')
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout
      }
    ]
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: 1200,
            margin: '0 auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <span style={{ fontSize: 20, fontWeight: 600 }}>PPT分享</span>
            </Link>

            <Menu
              mode="horizontal"
              selectedKeys={[window.location.pathname]}
              style={{ borderBottom: 'none', minWidth: 400 }}
              items={[
                {
                  key: '/',
                  icon: <HomeOutlined />,
                  label: <Link to="/">首页</Link>
                },
                {
                  key: '/search',
                  icon: <SearchOutlined />,
                  label: <Link to="/search">搜索</Link>
                },
                {
                  key: '/upload',
                  icon: <UploadOutlined />,
                  label: <Link to="/upload">上传</Link>
                }
              ]}
            />
          </div>

          <div>
            {user ? (
              <Dropdown menu={userMenu} placement="bottomRight">
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar
                    src={user.avatar}
                    icon={!user.avatar && <UserOutlined />}
                  />
                  <span>{user.nickname || user.username}</span>
                </Space>
              </Dropdown>
            ) : (
              <Space>
                <Button type="link" onClick={() => navigate('/login')}>
                  登录
                </Button>
                <Button type="primary" onClick={() => navigate('/register')}>
                  注册
                </Button>
              </Space>
            )}
          </div>
        </div>
      </Header>

      <Content style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', background: '#fff', marginTop: 40 }}>
        <p>在线PPT分享系统 © 2024</p>
      </Footer>
    </AntLayout>
  )
}

export default Layout
