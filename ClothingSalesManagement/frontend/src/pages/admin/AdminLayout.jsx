import { Layout, Menu, message } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  PictureOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  LogoutOutlined,
  FireOutlined,
  RocketOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const location = useLocation();

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.includes('hot-products') || path.includes('new-products') || path.includes('recommend-products')) {
      const key = path.replace('/admin/', '');
      return [key];
    }
    const key = path.replace('/admin/', '');
    return [key];
  };

  const getOpenKeys = () => {
    const path = location.pathname;
    if (path.includes('hot-products') || path.includes('new-products') || path.includes('recommend-products')) {
      return ['config'];
    }
    return [];
  };

  const menuItems = [
    { key: 'products', icon: <ShoppingOutlined />, label: '商品管理' },
    { key: 'categories', icon: <AppstoreOutlined />, label: '分类管理' },
    { key: 'banners', icon: <PictureOutlined />, label: '轮播图配置' },
    {
      key: 'config',
      icon: <SettingOutlined />,
      label: '商品配置',
      children: [
        { key: 'hot-products', icon: <FireOutlined />, label: '热销商品' },
        { key: 'new-products', icon: <RocketOutlined />, label: '新品上线' },
        { key: 'recommend-products', icon: <StarOutlined />, label: '为你推荐' },
      ],
    },
    { key: 'users', icon: <UserOutlined />, label: '会员管理' },
    { key: 'orders', icon: <ShoppingCartOutlined />, label: '订单管理' },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(`/admin/${key}`);
  };

  const handleLogout = async () => {
    await logout();
    message.success('退出成功');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={220}>
        <div style={{
          height: 64,
          color: '#fff',
          fontSize: 18,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          管理后台
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 18 }}>服装销售管理系统</span>
          <Menu mode="horizontal" style={{ border: 'none' }}>
            <Menu.SubMenu key="user" icon={<UserOutlined />} title={user?.username}>
              <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                退出登录
              </Menu.Item>
            </Menu.SubMenu>
          </Menu>
        </Header>
        <Content style={{ margin: '24px', background: '#fff', padding: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
