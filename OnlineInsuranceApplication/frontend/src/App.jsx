import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Layout, Menu, Badge } from 'antd'
import {
  FileProtectOutlined,
  DashboardOutlined,
  BellOutlined,
  FileSearchOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import PolicyList from './pages/PolicyList'
import PolicyDetail from './pages/PolicyDetail'
import ReminderPage from './pages/ReminderPage'
import ClaimPage from './pages/ClaimPage'
import StatisticsPage from './pages/StatisticsPage'
import { reminderApi } from './api'

const { Header, Sider, Content } = Layout

function App() {
  const [pendingReminderCount, setPendingReminderCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPendingReminderCount()
  }, [])

  const fetchPendingReminderCount = async () => {
    try {
      const data = await reminderApi.getPendingCount()
      setPendingReminderCount(data.count || 0)
    } catch (error) {
      console.error('Failed to fetch reminder count:', error)
    }
  }

  const menuItems = [
    {
      key: '1',
      icon: <FileProtectOutlined />,
      label: <Link to="/" className="menu-link">保单列表</Link>,
    },
    {
      key: '2',
      icon: <BellOutlined />,
      label: (
        <Link to="/reminders" className="menu-link">
          <Badge count={pendingReminderCount} offset={[10, 0]}>
            提醒中心
          </Badge>
        </Link>
      ),
    },
    {
      key: '3',
      icon: <FileSearchOutlined />,
      label: <Link to="/claims" className="menu-link">理赔管理</Link>,
    },
    {
      key: '4',
      icon: <BarChartOutlined />,
      label: <Link to="/statistics" className="menu-link">数据统计</Link>,
    },
  ]

  return (
    <Layout className="app-container">
      <Header style={{ background: '#001529' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <DashboardOutlined style={{ color: '#fff', fontSize: '24px', marginRight: '12px' }} />
          <h1 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>在线保单管理系统</h1>
        </div>
      </Header>
      <Layout>
        <Sider width={200} theme="dark">
          <Menu
            mode="inline"
            theme="dark"
            defaultSelectedKeys={['1']}
            items={menuItems}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        <Content className="main-content">
          <Routes>
            <Route path="/" element={<PolicyList />} />
            <Route path="/policy/:id" element={<PolicyDetail />} />
            <Route path="/reminders" element={<ReminderPage />} />
            <Route path="/claims" element={<ClaimPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
