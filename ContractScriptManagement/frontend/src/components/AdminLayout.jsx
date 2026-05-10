import { Layout, Menu } from 'antd'
import {
  UserOutlined, BookOutlined, TagOutlined, ShoppingOutlined,
  HomeOutlined, MessageOutlined, InfoCircleOutlined, PictureOutlined
} from '@ant-design/icons'
import { useLocation, useNavigate, Link, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'

const { Sider, Header, Content, Footer } = Layout

function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAdmin, loading } = useAuth()

  useEffect(() => {
    if (!loading && (!user || !isAdmin())) {
      navigate('/')
    }
  }, [user, isAdmin, loading, navigate])

  const menuItems = [
    { key: '/admin/users', icon: <UserOutlined />, label: <Link to="/admin/users">用户管理</Link> },
    { key: '/admin/scripts', icon: <BookOutlined />, label: <Link to="/admin/scripts">剧本管理</Link> },
    { key: '/admin/types', icon: <TagOutlined />, label: <Link to="/admin/types">剧本类型</Link> },
    { key: '/admin/rooms', icon: <HomeOutlined />, label: <Link to="/admin/rooms">房间管理</Link> },
    { key: '/admin/orders', icon: <ShoppingOutlined />, label: <Link to="/admin/orders">订单管理</Link> },
    { key: '/admin/discussions', icon: <MessageOutlined />, label: <Link to="/admin/discussions">讨论管理</Link> },
    { key: '/admin/news', icon: <InfoCircleOutlined />, label: <Link to="/admin/news">资讯管理</Link> },
    { key: '/admin/carousels', icon: <PictureOutlined />, label: <Link to="/admin/carousels">轮播图管理</Link> }
  ]

  const getActiveKey = () => {
    const path = location.pathname
    if (path === '/admin' || path === '/admin/') return '/admin/users'
    return path
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} style={{ background: '#001529' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
          后台管理
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[getActiveKey()]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 16 }}>欢迎, {user?.nickname || user?.username}</div>
          <Link to="/">返回前台</Link>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 360 }}>
          <Outlet />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          有约剧本杀管理系统 Admin ©2024
        </Footer>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
