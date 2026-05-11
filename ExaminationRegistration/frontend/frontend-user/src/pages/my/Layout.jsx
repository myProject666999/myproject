import React from 'react'
import { Layout, Menu, Row, Col } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { 
  UserOutlined, 
  ShoppingCartOutlined, 
  BookOutlined, 
  FileTextOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  CloseCircleOutlined,
  StarOutlined,
  EditOutlined
} from '@ant-design/icons'

const { Sider, Content } = Layout

const MyLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const getSelectedKey = () => {
    const path = location.pathname
    if (path.includes('profile')) return 'profile'
    if (path.includes('orders')) return 'orders'
    if (path.includes('addresses')) return 'addresses'
    if (path.includes('exam-records')) return 'exam-records'
    if (path.includes('wrong-questions')) return 'wrong-questions'
    if (path.includes('favorites')) return 'favorites'
    if (path.includes('my-posts')) return 'my-posts'
    return 'profile'
  }

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => navigate('/my/profile')
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: '我的订单',
      onClick: () => navigate('/my/orders')
    },
    {
      key: 'addresses',
      icon: <EnvironmentOutlined />,
      label: '我的地址',
      onClick: () => navigate('/my/addresses')
    },
    {
      key: 'exam-records',
      icon: <HistoryOutlined />,
      label: '考试记录',
      onClick: () => navigate('/my/exam-records')
    },
    {
      key: 'wrong-questions',
      icon: <CloseCircleOutlined />,
      label: '错题本',
      onClick: () => navigate('/my/wrong-questions')
    },
    {
      key: 'favorites',
      icon: <StarOutlined />,
      label: '我的收藏',
      onClick: () => navigate('/my/favorites')
    },
    {
      key: 'my-posts',
      icon: <EditOutlined />,
      label: '我的发布',
      onClick: () => navigate('/my/my-posts')
    }
  ]

  return (
    <Layout style={{ background: 'transparent' }}>
      <Sider width={200} style={{ background: 'white', borderRadius: 8 }}>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{ height: '100%', borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ background: 'transparent', marginLeft: 24 }}>
        <Content style={{ background: 'transparent' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MyLayout
