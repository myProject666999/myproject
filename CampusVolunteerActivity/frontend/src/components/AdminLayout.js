import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  UserOutlined,
  PictureOutlined,
  LogoutOutlined,
  BarChartOutlined,
  TeamOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: '数据概览',
    },
    {
      key: '/admin/activities',
      icon: <CalendarOutlined />,
      label: '活动管理',
    },
    {
      key: '/admin/volunteers',
      icon: <TeamOutlined />,
      label: '志愿者管理',
      children: [
        {
          key: '/admin/volunteers',
          icon: <UserOutlined />,
          label: '志愿者列表',
        },
        {
          key: '/admin/excellent-volunteers',
          icon: <CrownOutlined />,
          label: '优秀志愿者',
        },
      ],
    },
    {
      key: '/admin/carousels',
      icon: <PictureOutlined />,
      label: '轮播图管理',
    },
    {
      key: '/admin/stats',
      icon: <BarChartOutlined />,
      label: '统计报表',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ height: 64, margin: 16, textAlign: 'center' }}>
          {collapsed ? (
            <span style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>管理</span>
          ) : (
            <span style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>管理后台</span>
          )}
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
        <Header style={{ padding: '0 24px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: '100%' }}>
            <Dropdown menu={{ items: userMenuItems }}>
              <Space className="user-avatar" style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} src={user?.avatar} />
                <span style={{ color: '#1890ff', fontWeight: 'bold' }}>管理员</span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '24px' }}>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
