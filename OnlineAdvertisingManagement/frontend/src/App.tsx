import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  AppstoreOutlined,
  FileImageOutlined,
  CalendarOutlined,
  BarChartOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import AdSpacesPage from './pages/AdSpacesPage';
import AdMaterialsPage from './pages/AdMaterialsPage';
import AdSchedulesPage from './pages/AdSchedulesPage';
import AdStatsPage from './pages/AdStatsPage';
import DashboardPage from './pages/DashboardPage';

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">数据概览</Link>,
    },
    {
      key: '/ad-spaces',
      icon: <AppstoreOutlined />,
      label: <Link to="/ad-spaces">广告位管理</Link>,
    },
    {
      key: '/ad-materials',
      icon: <FileImageOutlined />,
      label: <Link to="/ad-materials">素材管理</Link>,
    },
    {
      key: '/ad-schedules',
      icon: <CalendarOutlined />,
      label: <Link to="/ad-schedules">投放排期</Link>,
    },
    {
      key: '/ad-stats',
      icon: <BarChartOutlined />,
      label: <Link to="/ad-stats">统计分析</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 24px' }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          广告位管理系统
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
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: '#fff',
              borderRadius: 8,
            }}
          >
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/ad-spaces" element={<AdSpacesPage />} />
              <Route path="/ad-materials" element={<AdMaterialsPage />} />
              <Route path="/ad-schedules" element={<AdSchedulesPage />} />
              <Route path="/ad-stats" element={<AdStatsPage />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;
