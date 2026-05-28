import { Layout, Menu, Avatar, Dropdown } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  InboxOutlined,
  ExportOutlined,
  EnvironmentOutlined,
  FileSearchOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '库存总览',
  },
  {
    key: '/inbound',
    icon: <InboxOutlined />,
    label: '入库管理',
  },
  {
    key: '/outbound',
    icon: <ExportOutlined />,
    label: '出库/拣货',
  },
  {
    key: '/location',
    icon: <EnvironmentOutlined />,
    label: '库位管理',
  },
  {
    key: '/stocktake',
    icon: <FileSearchOutlined />,
    label: '盘点任务',
  },
  {
    key: '/inventory-log',
    icon: <BarChartOutlined />,
    label: '库存流水',
  },
]

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  return (
    <Layout className="app-layout">
      <Sider theme="dark">
        <div className="logo">智能仓储WMS</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          }}
        >
          <Dropdown menu={{ items: userMenuItems }}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>管理员</span>
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '24px',
            overflow: 'auto',
          }}
        >
          <div className="page-content">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
