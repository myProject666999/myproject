import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  TrophyOutlined,
  StarOutlined,
  FileDoneOutlined,
  MessageOutlined,
  SettingOutlined,
  LockOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/request';

const { Header, Sider, Content } = Layout;

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState({});
  const [permissions, setPermissions] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const res = await api.get('/permissions/my');
      setPermissions(res.data || {});
    } catch (error) {
      console.error('Load permissions error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'password',
      icon: <LockOutlined />,
      label: '修改密码',
      onClick: () => navigate('/change-password'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const allMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '首页',
    },
    {
      key: 'personal',
      icon: <UserOutlined />,
      label: '个人管理',
      children: [
        {
          key: '/profile',
          label: '个人资料',
        },
        {
          key: '/change-password',
          label: '修改密码',
        },
      ],
    },
    {
      key: '/students',
      icon: <TeamOutlined />,
      label: '学生信息管理',
    },
    {
      key: '/teachers',
      icon: <FileTextOutlined />,
      label: '教师信息管理',
    },
    {
      key: '/grades',
      icon: <FileDoneOutlined />,
      label: '学生成绩管理',
    },
    {
      key: '/rewards',
      icon: <TrophyOutlined />,
      label: '奖惩管理',
    },
    {
      key: '/ability',
      icon: <StarOutlined />,
      label: '能力加分管理',
    },
    {
      key: '/evaluations',
      icon: <FileDoneOutlined />,
      label: '综合素质测评管理',
    },
    {
      key: '/messages',
      icon: <MessageOutlined />,
      label: '留言板管理',
    },
    {
      key: '/permissions',
      icon: <SettingOutlined />,
      label: '权限配置',
    },
  ];

  const filterMenuItems = (items) => {
    return items
      .map((item) => {
        if (item.children) {
          const filteredChildren = filterMenuItems(item.children);
          if (filteredChildren.length > 0) {
            return { ...item, children: filteredChildren };
          }
          return null;
        }
        const moduleKey = item.key.replace('/', '');
        if (item.key === '/dashboard' || item.key === '/profile' || item.key === '/change-password') {
          return item;
        }
        if (item.key === '/permissions' && user.role !== 'admin') {
          return null;
        }
        if (permissions[moduleKey]?.can_view) {
          return item;
        }
        return null;
      })
      .filter(Boolean);
  };

  const menuItems = filterMenuItems(allMenuItems);

  const getSelectedKeys = () => [location.pathname];

  return (
    <Layout className="layout-container">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: collapsed ? 14 : 18, fontWeight: 'bold' }}>
          {collapsed ? '测评' : '综合素质测评系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="layout-header">
          <div style={{ color: 'white', fontSize: 16 }}>学生综合素质测评管理系统</div>
          <div className="header-right">
            <Dropdown menu={{ items: userMenuItems }}>
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user.real_name || user.username}</span>
                <span style={{ fontSize: 12, color: '#ccc' }}>({user.role === 'admin' ? '管理员' : user.role === 'teacher' ? '教师' : '学生'})</span>
              </div>
            </Dropdown>
            <Button type="text" danger onClick={handleLogout} icon={<LogoutOutlined />}>
              退出
            </Button>
          </div>
        </Header>
        <Content className="layout-content" style={{ background: colorBgContainer, margin: '24px 16px', padding: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
