import React, { useState, useEffect } from 'react'
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd'
import { UserOutlined, LogoutOutlined, ShoppingCartOutlined, SettingOutlined, BookOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Header, Content, Footer } = Layout

const AppLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
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
    navigate('/')
  }

  const getSelectedKey = () => {
    const path = location.pathname
    if (path === '/' || path === '/home') return 'home'
    if (path.startsWith('/intros')) return 'intros'
    if (path.startsWith('/projects') || path.startsWith('/cart')) return 'enrollment'
    if (path.startsWith('/papers') || path.startsWith('/exam-records') || path.startsWith('/wrong-questions')) return 'exam'
    if (path.startsWith('/posts')) return 'forum'
    if (path.startsWith('/my')) return 'my'
    return ''
  }

  const menuItems = [
    { key: 'home', label: '网站首页', onClick: () => navigate('/') },
    { key: 'intros', label: '学校简介', onClick: () => navigate('/intros') },
    { key: 'enrollment', label: '在线报名', onClick: () => navigate('/projects') },
    { key: 'exam', label: '试卷列表', onClick: () => navigate('/papers') },
    { key: 'forum', label: '论坛信息', onClick: () => navigate('/posts') },
  ]

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心', onClick: () => navigate('/my/profile') },
    { key: 'cart', icon: <ShoppingCartOutlined />, label: '购物车', onClick: () => navigate('/cart') },
    { key: 'orders', icon: <BookOutlined />, label: '我的订单', onClick: () => navigate('/my/orders') },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
  ]

  return (
    <Layout className="app-container">
      <Header className="header" style={{ padding: 0 }}>
        <div className="logo">考试报名管理系统</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
        {user ? (
          <div style={{ float: 'right', marginRight: 24 }}>
            <Dropdown menu={{ items: userMenuItems }}>
              <Button type="text" style={{ color: 'white' }}>
                <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                {user.nickname || user.username}
              </Button>
            </Dropdown>
          </div>
        ) : (
          <div style={{ float: 'right', marginRight: 24 }}>
            <Button type="text" style={{ color: 'white' }} onClick={() => navigate('/login')}>
              登录
            </Button>
            <Button type="primary" style={{ marginLeft: 8 }} onClick={() => navigate('/register')}>
              注册
            </Button>
          </div>
        )}
      </Header>
      <Content style={{ padding: '24px 50px', minHeight: 'calc(100vh - 200px)' }}>
        {children}
      </Content>
      <Footer className="footer">
        <p>考试报名管理系统 ©2024 Created by React + Golang</p>
        <p style={{ marginTop: 8, color: '#999' }}>专业的在线考试与培训报名平台</p>
      </Footer>
    </Layout>
  )
}

export default AppLayout
