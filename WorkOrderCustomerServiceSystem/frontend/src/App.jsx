import React, { useState } from 'react'
import { Layout, Menu, Dropdown, Avatar } from 'antd'
import { 
  SolutionOutlined, 
  PlusOutlined, 
  DashboardOutlined, 
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import TicketList from './pages/TicketList.jsx'
import TicketDetail from './pages/TicketDetail.jsx'
import TicketCreate from './pages/TicketCreate.jsx'
import AgentWorkbench from './pages/AgentWorkbench.jsx'
import Statistics from './pages/Statistics.jsx'

const { Header, Content } = Layout

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentUser] = useState({
    id: 2,
    name: '客服小张',
    role: 'AGENT'
  })

  const menuItems = [
    { key: '/tickets', icon: <SolutionOutlined />, label: '工单列表' },
    { key: '/tickets/create', icon: <PlusOutlined />, label: '提交工单' },
    { key: '/workbench', icon: <DashboardOutlined />, label: '客服工作台' },
    { key: '/statistics', icon: <BarChartOutlined />, label: '统计报表' }
  ]

  const handleMenuClick = (e) => {
    navigate(e.key)
  }

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' }
  ]

  return (
    <Layout className="app-container">
      <Header className="header">
        <div className="logo">
          <SolutionOutlined style={{ fontSize: 24 }} />
          工单/客服系统
        </div>
        <Menu
          theme="light"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ flex: 1, justifyContent: 'center' }}
        />
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar icon={<UserOutlined />} />
            <span>{currentUser.name}</span>
          </div>
        </Dropdown>
      </Header>
      <Content className="main-content">
        <Routes>
          <Route path="/" element={<TicketList />} />
          <Route path="/tickets" element={<TicketList />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/tickets/create" element={<TicketCreate />} />
          <Route path="/workbench" element={<AgentWorkbench />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </Content>
    </Layout>
  )
}

export default App