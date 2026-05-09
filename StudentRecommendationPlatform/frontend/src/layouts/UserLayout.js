import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar, Badge } from 'antd';
import { UserOutlined, LogoutOutlined, HomeOutlined, BookOutlined, BulbOutlined, PlayCircleOutlined, MessageOutlined } from '@ant-design/icons';
import request from '../utils/request';

const { Header, Content, Footer } = Layout;

function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
    { key: '/books', icon: <BookOutlined />, label: <Link to="/books">书籍</Link> },
    { key: '/knowledge', icon: <BulbOutlined />, label: <Link to="/knowledge">知识点</Link> },
    { key: '/courses', icon: <PlayCircleOutlined />, label: <Link to="/courses">课程</Link> },
    { key: '/messages', icon: <MessageOutlined />, label: <Link to="/messages">留言</Link> },
  ];

  const userMenu = {
    items: [
      { key: '1', label: <Link to="/messages">我的留言</Link> },
      { key: '2', label: '退出登录', icon: <LogoutOutlined />, onClick: handleLogout },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1, 
        width: '100%',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '0 50px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff', marginRight: '40px' }}>
            学生推荐平台
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ flex: 1, borderBottom: 'none' }}
          />
          {user ? (
            <Dropdown menu={userMenu}>
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Avatar icon={<UserOutlined />} />
                <span style={{ marginLeft: '8px' }}>{user.nickname || user.username}</span>
              </div>
            </Dropdown>
          ) : (
            <div>
              <Button type="link" onClick={() => navigate('/login')}>登录</Button>
              <Button type="primary" onClick={() => navigate('/register')}>注册</Button>
            </div>
          )}
        </div>
      </Header>
      <Content style={{ padding: '24px 50px', background: '#f0f2f5' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 'calc(100vh - 200px)' }}>
          <Outlet />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        学生推荐平台 ©2024 Created by Student Recommendation Platform
      </Footer>
    </Layout>
  );
}

export default UserLayout;
