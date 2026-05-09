import React from 'react';
import { Layout, Menu, Dropdown, Avatar, message } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  BellOutlined, 
  BookOutlined, 
  ShoppingOutlined,
  GiftOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  LogoutOutlined,
  ReconciliationOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AdminHome from '../pages/admin/Home';
import Students from '../pages/admin/Students';
import Notices from '../pages/admin/Notices';
import Advocates from '../pages/admin/Advocates';
import Bags from '../pages/admin/Bags';
import Products from '../pages/admin/Products';
import Bins from '../pages/admin/Bins';
import Throws from '../pages/admin/Throws';
import Exchanges from '../pages/admin/Exchanges';
import Creatives from '../pages/admin/Creatives';
import SiteInfo from '../pages/admin/SiteInfo';
import Profile from '../pages/admin/Profile';

const { Header, Sider, Content, Footer } = Layout;

const menuItems = [
  { key: '/admin', icon: <DashboardOutlined />, label: '首页' },
  { key: '/admin/students', icon: <UserOutlined />, label: '学生管理' },
  { key: '/admin/notices', icon: <BellOutlined />, label: '公告管理' },
  { key: '/admin/advocates', icon: <BookOutlined />, label: '文明倡导' },
  { key: '/admin/bags', icon: <ShoppingCartOutlined />, label: '垃圾袋管理' },
  { key: '/admin/products', icon: <GiftOutlined />, label: '商品管理' },
  { key: '/admin/bins', icon: <DeleteOutlined />, label: '垃圾桶管理' },
  { key: '/admin/throws', icon: <ReconciliationOutlined />, label: '扔垃圾记录' },
  { key: '/admin/exchanges', icon: <ShoppingOutlined />, label: '商品兑换记录' },
  { key: '/admin/creatives', icon: <BulbOutlined />, label: '创意信息' },
  { key: '/admin/siteinfo', icon: <SettingOutlined />, label: '网站信息' },
  { key: '/admin/profile', icon: <UserOutlined />, label: '个人设置' },
];

function AdminLayout() {
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
      <Menu.Item key="profile" onClick={() => navigate('/admin/profile')}>
        <UserOutlined /> 个人设置
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>
        <LogoutOutlined /> 退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} theme="dark">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          🌱 后台管理
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
        <Header style={{ background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px' }}>
          <Dropdown overlay={userMenu}>
            <span style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span style={{ marginLeft: 8 }}>
                {user.admin?.real_name || user.username}
              </span>
            </span>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px', padding: 24, background: '#fff', minHeight: 280 }}>
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/students" element={<Students />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/advocates" element={<Advocates />} />
            <Route path="/bags" element={<Bags />} />
            <Route path="/products" element={<Products />} />
            <Route path="/bins" element={<Bins />} />
            <Route path="/throws" element={<Throws />} />
            <Route path="/exchanges" element={<Exchanges />} />
            <Route path="/creatives" element={<Creatives />} />
            <Route path="/siteinfo" element={<SiteInfo />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: 'center' }}>校园垃圾分类管理系统 ©2026</Footer>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
