import { Layout, Menu, Dropdown, Avatar, Button, message } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { UserOutlined, HomeOutlined, CalendarOutlined, ShoppingOutlined, StarOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { API } from '../services/api'

const { Header, Sider, Content } = Layout

const UserLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userInfo = localStorage.getItem('user')
    if (!userInfo) {
      navigate('/user/login')
      return
    }
    setUser(JSON.parse(userInfo))
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await API.getProfile()
      if (res.data) {
        setUser(res.data)
        localStorage.setItem('user', JSON.stringify(res.data))
      }
    } catch (e) {}
  }

  const menuItems = [
    { key: '/user/home', icon: <HomeOutlined />, label: '首页' },
    { key: '/user/booking', icon: <CalendarOutlined />, label: '客房预订' },
    { key: '/user/orders', icon: <ShoppingOutlined />, label: '我的订单' },
    { key: '/user/member', icon: <StarOutlined />, label: '会员中心' },
    { key: '/user/reviews', icon: <StarOutlined />, label: '宾馆评价' },
    { key: '/user/my-reviews', icon: <StarOutlined />, label: '我的评价' },
    { key: '/user/profile', icon: <SettingOutlined />, label: '个人信息' },
  ]

  const handleMenuClick = (e) => {
    navigate(e.key)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/user/login')
    message.success('退出成功')
  }

  const userMenu = {
    items: [
      { key: 'profile', label: '个人中心', icon: <UserOutlined />, onClick: () => navigate('/user/profile') },
      { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, onClick: handleLogout }
    ]
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200}>
        <div style={{ height: 64, color: '#fff', fontSize: 20, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          金港宾馆
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
          <Dropdown menu={userMenu}>
            <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.username || '用户'}</span>
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

export default UserLayout
