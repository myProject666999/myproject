import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, theme } from 'antd';
import {
  DashboardOutlined,
  NodeIndexOutlined,
  BarChartOutlined,
  FileTextOutlined,
  TeamOutlined,
  DownloadOutlined,
  LogoutOutlined,
  UserOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const studentMenuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '学习概览' },
  { key: '/knowledge-graph', icon: <NodeIndexOutlined />, label: '知识图谱' },
  { key: '/mastery', icon: <BarChartOutlined />, label: '掌握度诊断' },
  { key: '/weak-points', icon: <BulbOutlined />, label: '薄弱点分析' },
  { key: '/recommendations', icon: <FileTextOutlined />, label: '推荐练习' },
  { key: '/reports', icon: <FileTextOutlined />, label: '学情报告' },
  { key: '/exports', icon: <DownloadOutlined />, label: '报告导出' },
];

const teacherMenuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '教学概览' },
  { key: '/classes', icon: <TeamOutlined />, label: '班级管理' },
  { key: '/knowledge-graph', icon: <NodeIndexOutlined />, label: '知识图谱' },
  { key: '/reports', icon: <FileTextOutlined />, label: '学情报告' },
  { key: '/exports', icon: <DownloadOutlined />, label: '数据导出' },
];

const adminMenuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '系统概览' },
  { key: '/classes', icon: <TeamOutlined />, label: '班级管理' },
  { key: '/knowledge-graph', icon: <NodeIndexOutlined />, label: '知识图谱' },
  { key: '/reports', icon: <FileTextOutlined />, label: '学情报告' },
  { key: '/exports', icon: <DownloadOutlined />, label: '数据导出' },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = user?.role === 'admin' ? adminMenuItems :
    user?.role === 'teacher' ? teacherMenuItems : studentMenuItems;

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: async () => {
        await logout();
        navigate('/login');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ background: '#001529' }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 14 : 18,
          fontWeight: 'bold',
        }}>
          {collapsed ? '📚' : '📚 学情诊断系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <Title level={4} style={{ margin: 0 }}>
            {menuItems.find(m => m.key === location.pathname)?.label || '学习概览'}
          </Title>
          <Space>
            <span style={{ marginRight: 8 }}>欢迎，{user?.realName || user?.username}</span>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar size="small" icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
            </Dropdown>
          </Space>
        </Header>
        <Content style={{
          margin: '24px',
          padding: 24,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
