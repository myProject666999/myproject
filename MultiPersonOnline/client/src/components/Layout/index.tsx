import { Outlet, useNavigate } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, theme, Button } from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useUserStore } from '@/store/userStore'

const { Header, Sider, Content } = Layout

export default function AppLayout() {
  const navigate = useNavigate()
  const { user, logout } = useUserStore()
  const { token } = theme.useToken()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人中心',
        onClick: () => navigate('/profile'),
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: '设置',
        onClick: () => navigate('/settings'),
      },
      { type: 'divider' as const },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  }

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '工作台',
    },
    {
      key: '/documents',
      icon: <FileTextOutlined />,
      label: '我的文档',
    },
    {
      key: '/recycle-bin',
      icon: <DeleteOutlined />,
      label: '回收站',
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{ background: token.colorBgContainer }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 'bold',
            color: token.colorPrimary,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <ShareAltOutlined style={{ marginRight: 8 }} />
          协同文档
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['/dashboard']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, paddingTop: 16 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Dropdown menu={userMenu} placement="bottomRight">
            <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar
                size="small"
                src={user?.avatarUrl || undefined}
                icon={!user?.avatarUrl && <UserOutlined />}
              />
              <span>{user?.nickname || user?.username}</span>
            </Button>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 24,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
            padding: 24,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
