import { Layout, Menu, Button, Dropdown, Avatar, message } from 'antd';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { DashboardOutlined, FileTextOutlined, HistoryOutlined, TrophyOutlined, BookOutlined, ScheduleOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import useAuthStore from '../store/useAuthStore';

const { Header, Sider, Content, Footer } = Layout;

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const getSelectedKey = () => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') return '1';
    if (location.pathname.startsWith('/admin/profile')) return '7';
    if (location.pathname.startsWith('/admin/archives')) return '2';
    if (location.pathname.startsWith('/admin/archive-changes')) return '3';
    if (location.pathname.startsWith('/admin/rewards-punishments')) return '4';
    if (location.pathname.startsWith('/admin/training-enrollments')) return '5';
    if (location.pathname.startsWith('/admin/courses')) return '6';
    return '1';
  };

  const handleLogout = () => {
    logout();
    message.success('退出成功');
    navigate('/login');
  };

  const userMenu = {
    items: [
      {
        key: '1',
        icon: <UserOutlined />,
        label: <Link to="/admin/profile">个人中心</Link>,
      },
      {
        key: '2',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  };

  const menuItems = [
    { key: '1', icon: <DashboardOutlined />, label: <Link to="/admin">控制台</Link> },
    { key: '2', icon: <FileTextOutlined />, label: <Link to="/admin/archives">档案管理</Link> },
    { key: '3', icon: <HistoryOutlined />, label: <Link to="/admin/archive-changes">档案变动</Link> },
    { key: '4', icon: <TrophyOutlined />, label: <Link to="/admin/rewards-punishments">奖惩管理</Link> },
    { key: '5', icon: <ScheduleOutlined />, label: <Link to="/admin/training-enrollments">报名审核</Link> },
    { key: '6', icon: <BookOutlined />, label: <Link to="/admin/courses">课程管理</Link> },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={220}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
          管理后台
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,21,41,0.08)' }}>
          <div style={{ fontSize: 16, fontWeight: 500 }}>
            劳模管理系统
          </div>
          <div>
            <Button type="link" onClick={() => navigate('/')} style={{ marginRight: 16 }}>
              返回前台
            </Button>
            <Dropdown menu={userMenu} placement="bottomRight">
              <Button type="text">
                <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: '8px' }} />
                {user?.name || user?.username}
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '24px', background: '#fff', padding: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
        <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
          劳模管理系统 ©{new Date().getFullYear()} Created for Model Worker Management
        </Footer>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
