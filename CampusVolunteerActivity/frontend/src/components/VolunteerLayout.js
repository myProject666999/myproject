import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Space, Badge } from 'antd';
import {
  HomeOutlined,
  CalendarOutlined,
  UserOutlined,
  TrophyOutlined,
  SettingOutlined,
  LogoutOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

const VolunteerLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/activities',
      icon: <CalendarOutlined />,
      label: '活动列表',
    },
    {
      key: '/my-activities',
      icon: <HistoryOutlined />,
      label: '我的活动',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: '/points',
      icon: <TrophyOutlined />,
      label: '我的积分',
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
      key: 'profile',
      icon: <SettingOutlined />,
      label: '个人设置',
      onClick: () => navigate('/profile'),
    },
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
            <span style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>志愿</span>
          ) : (
            <span style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>志愿者活动系统</span>
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
            <Space size="middle">
              <Badge count={user?.points || 0} showZero color="#52c41a">
                <span>积分</span>
              </Badge>
              <Dropdown menu={{ items: userMenuItems }}>
                <Space className="user-avatar" style={{ cursor: 'pointer' }}>
                  <Avatar icon={<UserOutlined />} src={user?.avatar} />
                  <span>{user?.real_name || user?.username}</span>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content style={{ margin: '24px' }}>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default VolunteerLayout;
