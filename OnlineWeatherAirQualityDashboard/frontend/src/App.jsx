import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import {
  DashboardOutlined,
  LineChartOutlined,
  BarChartOutlined,
  BellOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import Dashboard from './pages/Dashboard.jsx'
import CityDetail from './pages/CityDetail.jsx'
import Trends from './pages/Trends.jsx'
import Comparison from './pages/Comparison.jsx'
import Settings from './pages/Settings.jsx'

const { Header, Sider, Content } = Layout

function App() {
  const location = useLocation()

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">看板首页</Link>,
    },
    {
      key: '/trends',
      icon: <LineChartOutlined />,
      label: <Link to="/trends">趋势分析</Link>,
    },
    {
      key: '/comparison',
      icon: <BarChartOutlined />,
      label: <Link to="/comparison">多城市对比</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">系统设置</Link>,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 24px' }}>
        <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', lineHeight: '64px' }}>
          <BellOutlined style={{ marginRight: '12px' }} />
          空气质量实时监控看板
        </div>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              background: '#fff',
              padding: '24px',
              margin: 0,
              minHeight: 'calc(100vh - 112px)',
              borderRadius: '8px',
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/city/:id" element={<CityDetail />} />
              <Route path="/trends" element={<Trends />} />
              <Route path="/comparison" element={<Comparison />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default App
