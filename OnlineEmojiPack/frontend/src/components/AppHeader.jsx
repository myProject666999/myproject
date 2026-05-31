import React, { useState } from 'react'
import { Layout, Menu, Button, Dropdown, Avatar, Space } from 'antd'
import {
  HomeOutlined,
  AppstoreOutlined,
  UserOutlined,
  UploadOutlined,
  LogoutOutlined,
  LoginOutlined
} from '@ant-design/icons'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useUserStore } from '../store/userStore'

const { Header } = Layout

const AppHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useUserStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        个人中心
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  )

  const getSelectedKey = () => {
    if (location.pathname.startsWith('/collections')) return 'collections'
    if (location.pathname.startsWith('/upload')) return 'upload'
    if (location.pathname.startsWith('/profile')) return 'profile'
    return 'home'
  }

  return (
    <Header className="header">
      <div className="header-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
          <div className="logo" onClick={() => navigate('/')}>
            🎨 表情素材库
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[getSelectedKey()]}
            style={{ border: 'none', background: 'transparent' }}
            onClick={({ key }) => {
              const paths = {
                home: '/',
                collections: '/collections',
                upload: '/upload',
                profile: '/profile'
              }
              navigate(paths[key])
            }}
            items={[
              { key: 'home', icon: <HomeOutlined />, label: '首页' },
              { key: 'collections', icon: <AppstoreOutlined />, label: '合集' },
              ...(user ? [
                { key: 'upload', icon: <UploadOutlined />, label: '上传' },
                { key: 'profile', icon: <UserOutlined />, label: '我的' }
              ] : [])
            ]}
          />
        </div>
        <div>
          {user ? (
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar src={user.avatar} icon={<UserOutlined />} />
                <span>{user.nickname}</span>
              </Space>
            </Dropdown>
          ) : (
            <Space>
              <Button onClick={() => navigate('/login')}>登录</Button>
              <Button type="primary" onClick={() => navigate('/register')}>注册</Button>
            </Space>
          )}
        </div>
      </div>
    </Header>
  )
}

export default AppHeader
