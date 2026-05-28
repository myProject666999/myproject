import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Drawer } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Dumbbell,
  BookOpen,
  User,
  LogOut,
  Menu as MenuIcon,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: '/',
    icon: <LayoutDashboard size={20} />,
    label: '仪表盘',
  },
  {
    key: '/meals',
    icon: <UtensilsCrossed size={20} />,
    label: '饮食记录',
  },
  {
    key: '/exercises',
    icon: <Dumbbell size={20} />,
    label: '运动记录',
  },
  {
    key: '/foods',
    icon: <BookOpen size={20} />,
    label: '食物库',
  },
  {
    key: '/profile',
    icon: <User size={20} />,
    label: '个人中心',
  },
];

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userDropdownItems = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const renderSider = () => (
    <Sider
      trigger={null}
      collapsible
      collapsed={!isMobile && collapsed}
      width={240}
      className="bg-white border-r border-gray-100 h-full"
      theme="light"
    >
      <div className="h-16 flex items-center justify-center border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <UtensilsCrossed size={18} className="text-white" />
          </div>
          {(!collapsed || isMobile) && (
            <span className="text-lg font-bold text-primary-600">健康饮食</span>
          )}
        </div>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        className="border-none mt-4"
        style={{ height: 'calc(100vh - 65px)' }}
      />
    </Sider>
  );

  return (
    <Layout className="min-h-screen bg-gray-50">
      {isMobile ? (
        <>
          <Drawer
            title={null}
            placement="left"
            onClose={() => setMobileMenuOpen(false)}
            open={mobileMenuOpen}
            width={240}
            styles={{ body: { padding: 0 } }}
            closeIcon={null}
            extra={
              <Button
                type="text"
                icon={<X size={20} />}
                onClick={() => setMobileMenuOpen(false)}
              />
            }
          >
            {renderSider()}
          </Drawer>
        </>
      ) : (
        renderSider()
      )}
      <Layout>
        <Header className="bg-white border-b border-gray-100 px-4 md:px-6 h-16 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {isMobile && (
              <Button
                type="text"
                icon={<MenuIcon size={20} />}
                onClick={() => setMobileMenuOpen(true)}
              />
            )}
            {!isMobile && (
              <Button
                type="text"
                onClick={() => setCollapsed(!collapsed)}
                icon={collapsed ? <MenuIcon size={20} /> : <MenuIcon size={20} />}
              />
            )}
          </div>
          <div className="flex items-center gap-3">
            <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">
                <Avatar size={32} className="bg-primary-500">
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                  {user?.username}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="p-4 md:p-6">
          <div className="transition-all duration-300 animate-fadeIn">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
