import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Button, message } from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  SafetyOutlined,
  LogoutOutlined,
  KeyOutlined,
} from '@ant-design/icons'
import { getUserInfo, logout, isAdmin } from '../utils/auth'
import request from '../utils/request'

const { Header, Sider, Content } = Layout

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const res = await request.get('/me')
      setUserInfo(res.data)
    } catch (error) {
      console.error('Failed to fetch user info:', error)
    }
  }

  const handleLogout = () => {
    logout()
    message.success('已退出登录')
    navigate('/login')
  }

  const handleChangePassword = () => {
    navigate('/change-password')
  }

  const userDropdownItems = [
    {
      key: '1',
      icon: <KeyOutlined />,
      label: '修改密码',
      onClick: handleChangePassword,
    },
    {
      key: '2',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  const allMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '首页',
    },
    {
      key: '/users',
      icon: <SafetyOutlined />,
      label: '用户管理',
      roles: ['admin'],
    },
    {
      key: '/doctors',
      icon: <UserOutlined />,
      label: '医生管理',
    },
    {
      key: '/nurses',
      icon: <UsergroupAddOutlined />,
      label: '护士管理',
    },
    {
      key: '/patients',
      icon: <UserOutlined />,
      label: '病人管理',
    },
    {
      key: '/medical-records',
      icon: <FileTextOutlined />,
      label: '病历管理',
    },
    {
      key: '/medicines',
      icon: <MedicineBoxOutlined />,
      label: '药品管理',
    },
  ]

  const userInfoData = getUserInfo()
  const userRole = userInfoData?.role

  const menuItems = allMenuItems.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(userRole)
  })

  const selectedKey = [location.pathname]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 14 : 18,
          fontWeight: 'bold',
          margin: 16,
        }}>
          {collapsed ? 'HMR' : '医院病历管理系统'}
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKey}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      
      <Layout>
        <Header className="ant-layout-header">
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            医院病历管理系统
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#666' }}>
              {userInfo?.real_name || userInfoData?.realName}
              <span style={{ marginLeft: 8, color: '#1890ff' }}>
                ({userInfo?.role === 'admin' ? '管理员' : userInfo?.role === 'doctor' ? '医生' : '护士'})
              </span>
            </span>
            <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight">
              <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
            </Dropdown>
          </div>
        </Header>
        
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
