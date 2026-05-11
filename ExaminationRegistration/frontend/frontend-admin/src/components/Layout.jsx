import React, { useState } from 'react'
import { Layout, Menu, Dropdown, Button, Avatar } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  UserOutlined,
  BookOutlined,
  FormOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  TrophyOutlined,
  LogoutOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/users', icon: <UserOutlined />, label: '用户管理' },
  { key: '/school-intros', icon: <BookOutlined />, label: '学校简介管理' },
  { key: '/enrollment-projects', icon: <FormOutlined />, label: '报名项目管理' },
  { key: '/exam-papers', icon: <FileTextOutlined />, label: '试卷管理' },
  { key: '/questions', icon: <QuestionCircleOutlined />, label: '试题管理' },
  { key: '/forum-posts', icon: <MessageOutlined />, label: '论坛管理' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: '订单管理' },
  { key: '/exam-management', icon: <TrophyOutlined />, label: '考试管理' }
]

const AdminLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminInfo')
    navigate('/login')
  }

  const userMenu = {
    items: [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout
      }
    ]
  }

  return (
    <Layout className="admin-layout">
      <Header className="admin-header">
        <div className="logo">考试报名管理系统</div>
        <Dropdown menu={userMenu}>
          <Button type="text" className="user-info">
            <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
            {adminInfo.username || '管理员'}
          </Button>
        </Dropdown>
      </Header>
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="light"
          width={200}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
