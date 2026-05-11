import { Layout, Menu, Button, Dropdown, Avatar, Input, message } from 'antd';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { HomeOutlined, BookOutlined, MessageOutlined, BellOutlined, UserOutlined, LogoutOutlined, SearchOutlined, HeartOutlined, EditOutlined } from '@ant-design/icons';
import useAuthStore from '../store/useAuthStore';
import { searchAPI } from '../api';

const { Header, Content, Footer } = Layout;
const { Search } = Input;

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const getSelectedKey = () => {
    if (location.pathname.startsWith('/trainings')) return '2';
    if (location.pathname.startsWith('/forum')) return '3';
    if (location.pathname.startsWith('/announcements')) return '4';
    if (location.pathname.startsWith('/profile') || location.pathname.startsWith('/my-')) return '5';
    return '1';
  };

  const handleLogout = () => {
    logout();
    message.success('退出成功');
    navigate('/login');
  };

  const handleSearch = async (value) => {
    if (!value.trim()) return;
    try {
      const res = await searchAPI(value);
      navigate('/search', { state: { results: res.data, query: value } });
    } catch (error) {
      message.error('搜索失败');
    }
  };

  const userMenu = {
    items: [
      {
        key: '1',
        icon: <UserOutlined />,
        label: <Link to="/profile">个人信息</Link>,
      },
      {
        key: '2',
        icon: <EditOutlined />,
        label: <Link to="/my-posts">我的发布</Link>,
      },
      {
        key: '3',
        icon: <HeartOutlined />,
        label: <Link to="/my-favorites">我的收藏</Link>,
      },
      {
        type: 'divider',
      },
      {
        key: '4',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  };

  const menuItems = [
    { key: '1', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
    { key: '2', icon: <BookOutlined />, label: <Link to="/trainings">培训信息</Link> },
    { key: '3', icon: <MessageOutlined />, label: <Link to="/forum">论坛交流</Link> },
    { key: '4', icon: <BellOutlined />, label: <Link to="/announcements">系统公告</Link> },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#001529', padding: '0 24px' }}>
        <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', marginRight: '40px' }}>
          劳模管理系统
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{ flex: 1, borderBottom: 'none' }}
        />
        <div style={{ marginRight: '20px' }}>
          <Search
            placeholder="搜索培训、公告、帖子..."
            onSearch={handleSearch}
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />
        </div>
        {isAuthenticated ? (
          <Dropdown menu={userMenu} placement="bottomRight">
            <Button type="text" style={{ color: '#fff' }}>
              <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: '8px' }} />
              {user?.name || user?.username}
            </Button>
          </Dropdown>
        ) : (
          <div>
            <Button type="primary" onClick={() => navigate('/login')} style={{ marginRight: '10px' }}>
              登录
            </Button>
            <Button onClick={() => navigate('/register')}>注册</Button>
          </div>
        )}
      </Header>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center', background: '#001529', color: '#fff' }}>
        劳模管理系统 ©{new Date().getFullYear()} Created for Model Worker Management
      </Footer>
    </Layout>
  );
}

export default MainLayout;
