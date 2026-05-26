import React, { useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Badge, Dropdown, Avatar, Space, message } from 'antd'
import {
  HomeOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  FileTextOutlined,
  SendOutlined,
  AppstoreOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { useAuthStore } from './store'
import { notificationApi } from './api'

const { Header, Content, Footer } = Layout

function AppHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user, logout, isJobSeeker, isHR } = useAuthStore()
  const [unreadCount, setUnreadCount] = React.useState(0)

  useEffect(() => {
    if (token) {
      notificationApi.getUnreadCount().then((count) => {
        setUnreadCount(count)
      }).catch(() => {})
    }
  }, [token, location.pathname])

  const handleLogout = () => {
    logout()
    message.success('已退出登录')
    navigate('/')
  }

  const guestMenu = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
    { key: '/jobs', icon: <SearchOutlined />, label: <Link to="/jobs">职位搜索</Link> },
  ]

  const jobSeekerMenu = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
    { key: '/jobs', icon: <SearchOutlined />, label: <Link to="/jobs">职位搜索</Link> },
    { key: '/resume/my', icon: <FileTextOutlined />, label: <Link to="/resume/my">我的简历</Link> },
    { key: '/applications/my', icon: <SendOutlined />, label: <Link to="/applications/my">投递记录</Link> },
  ]

  const hrMenu = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
    { key: '/jobs', icon: <SearchOutlined />, label: <Link to="/jobs">职位搜索</Link> },
    { key: '/hr/publish', icon: <AppstoreOutlined />, label: <Link to="/hr/publish">发布职位</Link> },
    { key: '/hr/applications', icon: <TeamOutlined />, label: <Link to="/hr/applications">招聘后台</Link> },
  ]

  const getMenuItems = () => {
    if (!token) return guestMenu
    if (isJobSeeker()) return jobSeekerMenu
    if (isHR()) return hrMenu
    return guestMenu
  }

  const userDropdownMenu = {
    items: [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  }

  return (
    <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        <Link to="/" style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff', textDecoration: 'none' }}>
          在线招聘系统
        </Link>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
          style={{ border: 'none', minWidth: 400 }}
        />
      </div>
      <Space size="middle">
        {token ? (
          <>
            <Badge count={unreadCount} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                onClick={() => navigate('/notifications')}
              />
            </Badge>
            <Dropdown menu={userDropdownMenu} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.username || '用户'}</span>
              </Space>
            </Dropdown>
          </>
        ) : (
          <>
            <Button type="primary" onClick={() => navigate('/login')}>登录</Button>
            <Button onClick={() => navigate('/register')}>注册</Button>
          </>
        )}
      </Space>
    </Header>
  )
}

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Routes>
          <Route path="/" element={<div>首页</div>} />
          <Route path="/jobs" element={<div>职位列表</div>} />
          <Route path="/jobs/:id" element={<div>职位详情</div>} />
          <Route path="/login" element={<div>登录</div>} />
          <Route path="/register" element={<div>注册</div>} />
          <Route path="/resume/my" element={<div>我的简历</div>} />
          <Route path="/applications/my" element={<div>投递记录</div>} />
          <Route path="/hr/publish" element={<div>发布职位</div>} />
          <Route path="/hr/applications" element={<div>招聘后台</div>} />
          <Route path="/notifications" element={<div>通知页</div>} />
        </Routes>
      </Content>
      <Footer style={{ textAlign: 'center', background: '#fff' }}>
        在线招聘系统 ©{new Date().getFullYear()} Created with Ant Design
      </Footer>
    </Layout>
  )
}

export default App
