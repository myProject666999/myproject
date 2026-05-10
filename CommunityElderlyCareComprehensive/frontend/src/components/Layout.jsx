import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, theme } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  CalendarOutlined,
  FileTextOutlined,
  HeartOutlined,
  SafetyCertificateOutlined,
  AppstoreOutlined,
  TagsOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

const iconMap = {
  setting: <SettingOutlined />,
  user: <UserOutlined />,
  team: <TeamOutlined />,
  menu: <AppstoreOutlined />,
  'medicine-box': <MedicineBoxOutlined />,
  insurance: <SafetyCertificateOutlined />,
  pill: <TagsOutlined />,
  heart: <HeartOutlined />,
  calendar: <CalendarOutlined />,
  'file-text': <FileTextOutlined />
};

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, isDoctor, isPatient, loading } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken();

  useEffect(() => {
    if (user) {
      const allMenus = [
        {
          key: '/system',
          icon: iconMap.setting,
          label: '系统管理',
          children: [
            { key: '/system/users', icon: iconMap.user, label: '用户管理' },
            { key: '/system/roles', icon: iconMap.team, label: '角色管理' },
            { key: '/system/menus', icon: iconMap.menu, label: '菜单管理' }
          ]
        },
        {
          key: '/medical',
          icon: iconMap['medicine-box'],
          label: '医疗管理',
          children: [
            { key: '/medical/insurances', icon: iconMap.insurance, label: '医保信息' },
            { key: '/medical/medicines', icon: iconMap.pill, label: '药物管理' },
            { key: '/medical/health', icon: iconMap.heart, label: '健康信息' }
          ]
        },
        {
          key: '/appointments',
          icon: iconMap.calendar,
          label: '预约管理'
        },
        {
          key: '/visits',
          icon: iconMap['file-text'],
          label: '就诊记录'
        }
      ];

      if (isPatient()) {
        setMenuItems(allMenus.filter(m => m.key !== '/system'));
      } else if (isDoctor()) {
        setMenuItems(allMenus.filter(m => m.key !== '/system'));
      } else {
        setMenuItems(allMenus);
      }
    }
  }, [user]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      加载中...
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout();
        navigate('/login');
      }
    }
  ];

  const getOpenKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/system')) return ['/system'];
    if (path.startsWith('/medical')) return ['/medical'];
    return [];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={220}>
        <div style={{
          height: 64,
          margin: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: collapsed ? 14 : 18,
          fontWeight: 'bold'
        }}>
          {collapsed ? '养老医疗' : '社区养老医疗平台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 64, height: 64 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>欢迎，{user.real_name || user.username}</span>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar icon={<UserOutlined />} />
            </Dropdown>
          </div>
        </Header>
        <Content style={{
          margin: '24px',
          padding: 24,
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
