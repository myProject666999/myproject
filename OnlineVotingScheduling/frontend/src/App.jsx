import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { Layout, Menu, Dropdown, Avatar, Space, Button } from 'antd'
import {
  DashboardOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SwapOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useUserStore } from './store'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AvailableTime from './pages/AvailableTime'
import ScheduleList from './pages/ScheduleList'
import ScheduleDetail from './pages/ScheduleDetail'
import ShiftSwap from './pages/ShiftSwap'
import Calendar from './pages/Calendar'
import Admin from './pages/Admin'
import Teams from './pages/Teams'

const { Header, Content, Sider } = Layout

function AppLayout() {
  const { user, logout } = useUserStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const userMenu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/admin">个人设置</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout} icon={<LogoutOutlined />}>
        退出登录
      </Menu.Item>
    </Menu>
  )

  const getMenuItems = () => {
    const items = [
      { key: '/', icon: <DashboardOutlined />, label: <Link to="/">仪表盘</Link> },
      { key: '/available-time', icon: <ClockCircleOutlined />, label: <Link to="/available-time">可用时间</Link> },
      { key: '/schedules', icon: <CalendarOutlined />, label: <Link to="/schedules">排班表</Link> },
      { key: '/shift-swaps', icon: <SwapOutlined />, label: <Link to="/shift-swaps">调班申请</Link> },
      { key: '/calendar', icon: <CalendarOutlined />, label: <Link to="/calendar">日历视图</Link> }
    ]

    if (user?.role === 'ADMIN') {
      items.push({ key: '/teams', icon: <TeamOutlined />, label: <Link to="/teams">团队管理</Link> })
      items.push({ key: '/admin', icon: <SettingOutlined />, label: <Link to="/admin">系统后台</Link> })
    }

    return items
  }

  return (
    <Layout className="app-layout">
      <Sider theme="dark" width={200}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          投票排班系统
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={[window.location.pathname]} items={getMenuItems()} />
      </Sider>
      <Layout>
        <Header className="app-header">
          <div></div>
          <Space>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Space style={{ cursor: 'pointer', color: 'white' }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.realName || user?.username}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/available-time" element={<AvailableTime />} />
            <Route path="/schedules" element={<ScheduleList />} />
            <Route path="/schedules/:id" element={<ScheduleDetail />} />
            <Route path="/shift-swaps" element={<ShiftSwap />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

function App() {
  const { token } = useUserStore()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login isRegister />} />
        <Route
          path="/*"
          element={token ? <AppLayout /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
