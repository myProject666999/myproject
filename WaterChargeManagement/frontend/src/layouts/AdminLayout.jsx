import React, { useState } from 'react'
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  HomeOutlined,
  DollarOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  KeyOutlined
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'

const { Header, Sider, Content } = Layout

const AdminLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const getUserInfo = () => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }

  const user = getUserInfo()

  const menuItems = [
    {
      key: '/admin/admins',
      icon: <UserOutlined />,
      label: '管理员管理'
    },
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: '用户管理'
    },
    {
      key: '/admin/communities',
      icon: <HomeOutlined />,
      label: '社区区域管理'
    },
    {
      key: '/admin/settlement-types',
      icon: <SettingOutlined />,
      label: '结算类型管理'
    },
    {
      key: '/admin/water-prices',
      icon: <DollarOutlined />,
      label: '水费价格管理'
    },
    {
      key: '/admin/water-meters',
      icon: <SettingOutlined />,
      label: '水表信息管理'
    },
    {
      key: '/admin/water-bills',
      icon: <FileTextOutlined />,
      label: '水费信息管理'
    },
    {
      key: '/admin/change-password',
      icon: <KeyOutlined />,
      label: '修改密码'
    }
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    navigate('/login')
  }

  const userMenu = {
    items: [
      {
        key: '1',
        icon: <KeyOutlined />,
        label: '修改密码',
        onClick: () => navigate('/admin/change-password')
      },
      {
        key: '2',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout
      }
    ]
  }

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
          fontSize: collapsed ? 12 : 16,
          fontWeight: 'bold'
        }}>
          {collapsed ? '水费' : '水费管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 'bold' }}>自来水分公司水费管理系统</div>
          <Dropdown menu={userMenu}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user.name || user.username}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div className="site-layout-content">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
