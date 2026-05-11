import { Layout, Menu, Dropdown, Avatar, Button, message } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { UserOutlined, HomeOutlined, UsergroupAddOutlined, SolutionOutlined, ShoppingCartOutlined, BarChartOutlined, SettingOutlined, LogoutOutlined, StarOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'

const { Header, Sider, Content } = Layout

const AdminLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [admin, setAdmin] = useState(null)

  useEffect(() => {
    const adminInfo = localStorage.getItem('admin')
    if (!adminInfo) {
      navigate('/admin/login')
      return
    }
    setAdmin(JSON.parse(adminInfo))
  }, [])

  const menuItems = [
    { key: '/admin/home', icon: <HomeOutlined />, label: '首页' },
    { key: '/admin/admins', icon: <UsergroupAddOutlined />, label: '管理员管理' },
    { key: '/admin/users', icon: <UserOutlined />, label: '用户管理' },
    { key: '/admin/rooms', icon: <SolutionOutlined />, label: '客房管理' },
    { key: '/admin/orders', icon: <ShoppingCartOutlined />, label: '订单管理' },
    { key: '/admin/reviews', icon: <StarOutlined />, label: '评价管理' },
    { key: '/admin/statistics', icon: <BarChartOutlined />, label: '统计分析' },
  ]

  const handleMenuClick = (e) => {
    navigate(e.key)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
    navigate('/admin/login')
    message.success('退出成功')
  }

  const adminMenu = {
    items: [
      { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, onClick: handleLogout }
    ]
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200}>
        <div style={{ height: 64, color: '#fff', fontSize: 20, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          金港宾馆后台
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{ height: 'calc(100vh - 64px)', borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div></div>
          <Dropdown menu={adminMenu}>
            <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>{admin?.username || '管理员'}</span>
            </Button>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8 }}>
          {children || <Outlet />}
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
