import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Button, Input, Badge, Space } from 'antd'
import {
  HomeOutlined,
  BookOutlined,
  ReadOutlined,
  TrophyOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  SearchOutlined,
  DashboardOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import './MainLayout.css'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/', icon: <HomeOutlined />, label: '首页' },
  { key: '/courses', icon: <BookOutlined />, label: '课程市场' },
  { key: '/learning', icon: <ReadOutlined />, label: '我的学习' },
  { key: '/teacher', icon: <DashboardOutlined />, label: '教师后台' },
  { key: '/certificates', icon: <TrophyOutlined />, label: '我的证书' },
]

const userMenu = [
  { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
  { key: 'settings', icon: <SettingOutlined />, label: '设置' },
  { type: 'divider' },
  { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
]

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      navigate('/login')
    } else if (key === 'profile') {
      navigate('/profile')
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        theme="dark"
      >
        <div className="logo">
          <span className="logo-icon">MOOC</span>
          {!collapsed && <span className="logo-text">在线学习平台</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="main-header">
          <div className="header-search">
            <Input
              placeholder="搜索课程、老师..."
              prefix={<SearchOutlined />}
              allowClear
            />
          </div>
          <Space size="large" className="header-right">
            <Badge count={3} size="small">
              <Button type="text" shape="circle" icon={<BellOutlined />} />
            </Badge>
            <Dropdown menu={{ items: userMenu, onClick: handleMenuClick }} placement="bottomRight">
              <Space className="user-info" style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} src={userInfo.avatar} />
                <span className="user-name">{userInfo.username || '未登录'}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content className="main-content">{children}</Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
