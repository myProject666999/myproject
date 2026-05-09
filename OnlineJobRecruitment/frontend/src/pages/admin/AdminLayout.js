import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, message } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  AuditOutlined,
  BookOutlined,
  MessageOutlined,
  LogoutOutlined,
  SettingOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.role !== 'admin') {
        message.error('请使用管理员账号登录');
        navigate('/login');
        return;
      }
      setUser(u);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    message.success('已退出登录');
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: '系统概览',
      onClick: () => navigate('/admin'),
    },
    {
      key: '/admin/admins',
      icon: <UserOutlined />,
      label: '管理员管理',
      onClick: () => navigate('/admin/admins'),
    },
    {
      key: '/admin/recruiters',
      icon: <TeamOutlined />,
      label: '招聘人员管理',
      onClick: () => navigate('/admin/recruiters'),
    },
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: '应聘人员管理',
      onClick: () => navigate('/admin/users'),
    },
    {
      key: '/admin/job-types',
      icon: <AppstoreOutlined />,
      label: '职位类型管理',
      onClick: () => navigate('/admin/job-types'),
    },
    {
      key: '/admin/jobs',
      icon: <AuditOutlined />,
      label: '职位管理',
      onClick: () => navigate('/admin/jobs'),
    },
    {
      key: '/admin/exercises',
      icon: <BookOutlined />,
      label: '练习题管理',
      onClick: () => navigate('/admin/exercises'),
    },
    {
      key: '/admin/news',
      icon: <MessageOutlined />,
      label: '资讯管理',
      onClick: () => navigate('/admin/news'),
    },
    {
      key: '/admin/reviews',
      icon: <MessageOutlined />,
      label: '评价管理',
      onClick: () => navigate('/admin/reviews'),
    },
  ];

  const userMenuItems = [
    {
      key: '1',
      icon: <SettingOutlined />,
      label: '修改密码',
      onClick: () => navigate('/change-password'),
    },
    {
      type: 'divider',
    },
    {
      key: '2',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const getSelectedKey = () => {
    if (location.pathname === '/admin') return '/admin';
    for (const item of menuItems) {
      if (location.pathname.startsWith(item.key) && item.key !== '/admin') {
        return item.key;
      }
    }
    return '/admin';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 16 : 20,
          fontWeight: 'bold',
        }}>
          {collapsed ? '招聘' : '招聘管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Dropdown menu={{ items: userMenuItems }}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.name || user?.username}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px', background: '#fff', padding: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
