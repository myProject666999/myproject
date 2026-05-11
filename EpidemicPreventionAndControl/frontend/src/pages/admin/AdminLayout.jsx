import React, { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Avatar, Button } from 'antd';
import { 
  HomeOutlined, 
  MedicineBoxOutlined, 
  ShopOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  BellOutlined, 
  DollarOutlined,
  LogoutOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/admin/dashboard', icon: <HomeOutlined />, label: '首页' },
  { key: '/admin/hospitals', icon: <MedicineBoxOutlined />, label: '医院管理' },
  { key: '/admin/manufacturers', icon: <ShopOutlined />, label: '厂商管理' },
  { key: '/admin/volunteers', icon: <TeamOutlined />, label: '志愿者管理' },
  { key: '/admin/activities', icon: <CalendarOutlined />, label: '活动管理' },
  { key: '/admin/announcements', icon: <BellOutlined />, label: '公告管理' },
  { key: '/admin/finances', icon: <DollarOutlined />, label: '财务收支' },
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const info = localStorage.getItem('userInfo');
    if (info) {
      setUserInfo(JSON.parse(info));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const userMenu = {
    items: [
      {
        key: '1',
        label: (
          <span onClick={handleLogout}>
            <LogoutOutlined /> 退出登录
          </span>
        ),
      },
    ],
  };

  return (
    <Layout className="admin-layout" style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="dark"
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 12 : 18,
          fontWeight: 'bold'
        }}>
          {collapsed ? '疫控' : '疫情防控管理系统'}
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
          background: '#fff', 
          padding: '0 24px', 
          display: 'flex', 
          justifyContent: 'flex-end',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,0.08)'
        }}>
          <Dropdown menu={userMenu}>
            <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>{userInfo?.name}</span>
            </Button>
          </Dropdown>
        </Header>
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
