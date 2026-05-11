import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Button, message } from 'antd';
import { 
  HomeOutlined, 
  BellOutlined, 
  InboxOutlined, 
  TeamOutlined, 
  UserOutlined, 
  LogoutOutlined,
  HeartOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    message.success('已退出登录');
    navigate('/login');
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: <Link to="/profile">个人中心</Link>,
      },
      {
        key: 'favorites',
        icon: <HeartOutlined />,
        label: <Link to="/favorites">我的收藏</Link>,
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
    ],
  };

  const getSelectedKey = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname.startsWith('/notices')) return 'notices';
    if (location.pathname.startsWith('/materials')) return 'materials';
    if (location.pathname.startsWith('/recruitments')) return 'recruitments';
    if (location.pathname.startsWith('/knowledge')) return 'knowledge';
    if (location.pathname.startsWith('/rumors')) return 'rumors';
    return 'home';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 24px',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 24 }}>
          <SafetyCertificateOutlined style={{ fontSize: 28, color: '#1890ff', marginRight: 8 }} />
          <h2 style={{ margin: 0, color: '#1890ff' }}>应急互助</h2>
        </div>
        
        <Menu
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          style={{ flex: 1, minWidth: 0, borderBottom: 'none' }}
          items={[
            { key: 'home', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
            { key: 'notices', icon: <BellOutlined />, label: <Link to="/notices">紧急通知</Link> },
            { key: 'materials', icon: <InboxOutlined />, label: <Link to="/materials">物资信息</Link> },
            { key: 'recruitments', icon: <TeamOutlined />, label: <Link to="/recruitments">招募信息</Link> },
            { key: 'knowledge', icon: <HeartOutlined />, label: <Link to="/knowledge">心理知识</Link> },
            { key: 'rumors', icon: <SafetyCertificateOutlined />, label: <Link to="/rumors">辟谣专区</Link> },
          ]}
        />

        {user ? (
          <Dropdown menu={userMenu}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
              <span>{user.real_name || user.username}</span>
            </div>
          </Dropdown>
        ) : (
          <Button type="primary" onClick={() => navigate('/login')}>登录/注册</Button>
        )}
      </Header>

      <Content style={{ padding: '24px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        {children}
      </Content>

      <Footer style={{ textAlign: 'center', background: '#f5f5f5' }}>
        应急互助信息管理系统 ©{new Date().getFullYear()} Created by Trae
      </Footer>
    </Layout>
  );
};

export default AppLayout;
