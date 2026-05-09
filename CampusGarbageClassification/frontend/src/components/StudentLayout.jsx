import React from 'react';
import { Layout, Menu, Dropdown, Avatar, Button, Carousel, Card, Row, Col, Input, message } from 'antd';
import { 
  HomeOutlined, 
  BellOutlined, 
  BookOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HomePage from '../pages/student/Home';
import NoticePage from '../pages/student/Notice';
import NoticeDetail from '../pages/student/NoticeDetail';
import AdvocatePage from '../pages/student/Advocate';
import BagPage from '../pages/student/Bag';
import ProductPage from '../pages/student/Product';
import ProfilePage from '../pages/student/Profile';
import CreativePage from '../pages/student/Creative';

const { Header, Content, Footer, Sider } = Layout;
const { Search } = Input;

const menuItems = [
  { key: '/', icon: <HomeOutlined />, label: '首页' },
  { key: '/notices', icon: <BellOutlined />, label: '公告信息' },
  { key: '/advocates', icon: <BookOutlined />, label: '文明倡导' },
  { key: '/bags', icon: <ShoppingCartOutlined />, label: '垃圾袋信息' },
  { key: '/products', icon: <ShoppingOutlined />, label: '商品兑换' },
  { key: '/profile', icon: <UserOutlined />, label: '会员中心' },
];

function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    message.success('已退出登录');
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        个人中心
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', padding: '0 24px', background: '#001529' }}>
        <div style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginRight: 48 }}>
          🌱 校园垃圾分类管理系统
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname.split('/').slice(0, 2).join('/') || '/']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, borderBottom: 'none', background: 'transparent' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
          <TrophyOutlined style={{ marginRight: 8 }} />
          <span style={{ marginRight: 16 }}>积分: {user.student?.points || 0}</span>
          <Dropdown overlay={userMenu}>
            <span style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span style={{ marginLeft: 8 }}>{user.student?.real_name || user.username}</span>
            </span>
          </Dropdown>
        </div>
      </Header>
      
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/notices" element={<NoticePage />} />
          <Route path="/notices/:id" element={<NoticeDetail />} />
          <Route path="/advocates" element={<AdvocatePage />} />
          <Route path="/bags" element={<BagPage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/creative" element={<CreativePage />} />
        </Routes>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#001529', color: 'white' }}>
        校园垃圾分类管理系统 ©2026
      </Footer>
    </Layout>
  );
}

export default StudentLayout;
