import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  TeamOutlined, 
  FileTextOutlined, 
  SmileOutlined, 
  BellOutlined, 
  SettingOutlined, 
  MessageOutlined, 
  PictureOutlined, 
  BookOutlined, 
  BulbOutlined, 
  PlayCircleOutlined, 
  AppstoreOutlined, 
  FileSearchOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import request from '../utils/request';

const { Header, Sider, Content, Footer } = Layout;

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');
    if (!token || !userData) {
      navigate('/admin/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const menuItems = [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: '数据概览' },
    { key: '/admin/admin-users', icon: <UserOutlined />, label: '管理员管理' },
    { key: '/admin/front-users', icon: <TeamOutlined />, label: '用户注册管理' },
    { key: '/admin/news', icon: <FileTextOutlined />, label: '站内新闻' },
    { key: '/admin/campus-stories', icon: <SmileOutlined />, label: '校园趣事' },
    { key: '/admin/notices', icon: <BellOutlined />, label: '通知公告' },
    { key: '/admin/settings', icon: <SettingOutlined />, label: '系统设置' },
    { key: '/admin/messages', icon: <MessageOutlined />, label: '留言管理' },
    { key: '/admin/carousels', icon: <PictureOutlined />, label: '轮播图管理' },
    { key: '/admin/books', icon: <BookOutlined />, label: '书籍管理' },
    { key: '/admin/knowledge', icon: <BulbOutlined />, label: '知识点管理' },
    { key: '/admin/courses', icon: <PlayCircleOutlined />, label: '课程管理' },
    { key: '/admin/categories', icon: <AppstoreOutlined />, label: '分类管理' },
    { key: '/admin/demands', icon: <FileSearchOutlined />, label: '需求管理' },
  ];

  const userMenu = {
    items: [
      { key: '1', label: '退出登录', icon: <LogoutOutlined />, onClick: handleLogout },
    ],
  };

  const selectedKey = location.pathname === '/admin' ? '/admin/dashboard' : location.pathname;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="dark">
        <div style={{ 
          height: 64, 
          margin: 16, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#fff',
          fontSize: 18,
          fontWeight: 'bold'
        }}>
          管理后台
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{ marginRight: 16 }}>
            <Link to="/" target="_blank">
              <Button type="link">返回首页</Button>
            </Link>
          </div>
          {user && (
            <Dropdown menu={userMenu}>
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Avatar icon={<UserOutlined />} />
                <span style={{ marginLeft: '8px' }}>{user.name}</span>
              </div>
            </Dropdown>
          )}
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          <Outlet />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          学生推荐平台管理后台 ©2024
        </Footer>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
