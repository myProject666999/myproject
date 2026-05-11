import React from 'react'
import { Layout, Menu, Avatar, Dropdown, Typography, Button } from 'antd'
import { 
  DashboardOutlined, UserOutlined, AppstoreOutlined, 
  ShoppingOutlined, PictureOutlined, FileTextOutlined, 
  ShoppingCartOutlined, LogoutOutlined 
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useUserStore } from '../../store/useStore'

const { Header, Sider, Content } = Layout
const { Title } = Typography

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useUserStore()

  const menuItems = [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: '数据概览' },
    { key: '/admin/users', icon: <UserOutlined />, label: '用户管理' },
    { key: '/admin/categories', icon: <AppstoreOutlined />, label: '分类管理' },
    { key: '/admin/products', icon: <ShoppingOutlined />, label: '商品管理' },
    { key: '/admin/banners', icon: <PictureOutlined />, label: '轮播图管理' },
    { key: '/admin/news', icon: <FileTextOutlined />, label: '资讯管理' },
    { key: '/admin/orders', icon: <ShoppingCartOutlined />, label: '订单管理' }
  ]

  const handleLogout = () => {
    logout()
    localStorage.removeItem('token')
    navigate('/admin/login')
  }

  const userMenuItems = [
    {
      key: 'home',
      label: '返回首页',
      onClick: () => navigate('/')
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  return (
    <Layout className="admin-layout" style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={200}>
        <div style={{ padding: 20, textAlign: 'center' }}>
          <Title level={4} style={{ color: '#fff', margin: 0 }}>后台管理</Title>
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
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} src={user?.avatar} />
              <span>{user?.username}</span>
            </div>
          </Dropdown>
        </Header>
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
