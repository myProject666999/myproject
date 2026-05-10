import { useState } from 'react'
import { Layout, Menu, Dropdown, Avatar, Button } from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  PictureOutlined,
  BellOutlined,
  SettingOutlined,
  LockOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import type { MenuProps } from 'antd'

const { Header, Sider, Content } = Layout

const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘'
  },
  {
    key: '/users',
    icon: <TeamOutlined />,
    label: '用户管理'
  },
  {
    key: '/publishers',
    icon: <UserOutlined />,
    label: '发布者管理'
  },
  {
    key: '/task-types',
    icon: <AppstoreOutlined />,
    label: '任务类型管理'
  },
  {
    key: '/tasks',
    icon: <FileTextOutlined />,
    label: '任务信息管理'
  },
  {
    key: '/results',
    icon: <CheckCircleOutlined />,
    label: '完成结果管理'
  },
  {
    key: '/banners',
    icon: <PictureOutlined />,
    label: '轮播图管理'
  },
  {
    key: '/announcements',
    icon: <BellOutlined />,
    label: '公告管理'
  }
]

const LayoutComponent = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
    navigate('/login')
  }

  const admin = JSON.parse(localStorage.getItem('admin') || '{}')

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: '个人信息',
      onClick: () => navigate('/profile')
    },
    {
      key: 'password',
      icon: <LockOutlined />,
      label: '修改密码',
      onClick: () => navigate('/change-password')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{
          height: 64,
          margin: 16,
          background: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 14 : 18,
          fontWeight: 'bold'
        }}>
          {collapsed ? 'URT' : '城市轨道交通'}
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
        <Header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px'
        }}>
          <div style={{ fontSize: 18, fontWeight: 500 }}>
            城市轨道交通激励APP管理系统
          </div>
          <Dropdown menu={{ items: userMenuItems }}>
            <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>{admin.nickname || admin.username || '管理员'}</span>
            </Button>
          </Dropdown>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{
            padding: 24,
            background: '#fff',
            minHeight: 360,
            borderRadius: 8
          }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default LayoutComponent
