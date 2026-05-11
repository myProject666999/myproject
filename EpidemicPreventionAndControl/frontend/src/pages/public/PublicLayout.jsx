import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Input } from 'antd';
import { 
  BellOutlined, 
  CalendarOutlined, 
  LogoutOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Content, Footer } = Layout;

const PublicLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(null);
  const [searchValue, setSearchValue] = useState('');

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

  const menuItems = [
    { key: '/public/announcements', icon: <BellOutlined />, label: '公告通知' },
    { key: '/public/activities', icon: <CalendarOutlined />, label: '抗疫活动' },
  ];

  return (
    <Layout className="public-layout" style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px', 
        display: 'flex', 
        alignItems: 'center',
        boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
        height: 64
      }}>
        <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff', marginRight: 40 }}>
          疫情防控管理系统
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, minWidth: 0 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span>欢迎，{userInfo?.name}</span>
          <Button type="text" onClick={handleLogout}>
            <LogoutOutlined /> 退出
          </Button>
        </div>
      </Header>
      <Content style={{ padding: '24px 50px', background: '#f0f2f5' }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        疫情防控管理系统 ©2026
      </Footer>
    </Layout>
  );
};

export default PublicLayout;
