import React, { useState, useEffect } from 'react'
import { Layout, Menu, Dropdown, Avatar, Button, Typography, theme } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserAddOutlined,
  ApartmentOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  ShoppingCartOutlined,
  ScheduleOutlined,
  BarChartOutlined,
  HomeOutlined,
  SafetyOutlined,
  SearchOutlined,
  SendOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { ROLE_NAME_MAP, type RoleType } from '../types'

const { Header, Sider, Content } = Layout
const { Title } = Typography

const menuConfig: Record<RoleType, any[]> = {
  admin: [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    {
      key: '/admin',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        { key: '/admin/users', icon: <UserAddOutlined />, label: '用户管理' },
        { key: '/admin/departments', icon: <ApartmentOutlined />, label: '科室管理' },
        { key: '/admin/registration-levels', icon: <ScheduleOutlined />, label: '挂号级别管理' },
        { key: '/admin/settlement-categories', icon: <SafetyOutlined />, label: '结算类别管理' },
        { key: '/admin/diagnosis-catalogs', icon: <FileTextOutlined />, label: '诊断目录管理' },
        { key: '/admin/charge-items', icon: <ShoppingCartOutlined />, label: '收费项目管理' },
        { key: '/admin/medicines', icon: <MedicineBoxOutlined />, label: '药品管理' },
        { key: '/admin/doctor-schedules', icon: <ScheduleOutlined />, label: '医生排班管理' },
        { key: '/admin/expense-subjects', icon: <BarChartOutlined />, label: '费用科目管理' },
      ],
    },
    { key: '/statistics', icon: <BarChartOutlined />, label: '工作量统计' },
    { key: '/daily-settlement', icon: <SafetyOutlined />, label: '日结管理' },
  ],
  doctor: [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/doctor/waiting', icon: <UserOutlined />, label: '候诊患者' },
    { key: '/doctor/prescriptions', icon: <MedicineBoxOutlined />, label: '处方管理' },
    { key: '/doctor/examinations', icon: <ExperimentOutlined />, label: '检查申请' },
    { key: '/doctor/treatments', icon: <FileTextOutlined />, label: '处置申请' },
    { key: '/doctor/fees', icon: <ShoppingCartOutlined />, label: '费用查询' },
  ],
  technician: [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/technician/workstation', icon: <ExperimentOutlined />, label: '医技工作站' },
    { key: '/technician/items', icon: <FileTextOutlined />, label: '常用项目维护' },
  ],
  pharmacy: [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/pharmacy/workstation', icon: <MedicineBoxOutlined />, label: '药房工作站' },
    { key: '/pharmacy/dispense', icon: <SendOutlined />, label: '发药' },
    { key: '/pharmacy/return', icon: <MedicineBoxOutlined />, label: '退药' },
  ],
  reception: [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/reception/registration', icon: <UserAddOutlined />, label: '挂号' },
    { key: '/reception/charge', icon: <ShoppingCartOutlined />, label: '收费' },
    { key: '/reception/patient-query', icon: <SearchOutlined />, label: '患者费用查询' },
  ],
}

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, role, logout } = useAuthStore()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const menuItems = role ? menuConfig[role] : []

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const userMenuItems = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: '2',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout()
        navigate('/login')
      },
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? 14 : 18,
            fontWeight: 'bold',
          }}
        >
          {collapsed ? '医院' : '医院管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
            >
              <div
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  borderRadius: 8,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <Avatar
                  style={{ backgroundColor: '#1677ff', verticalAlign: 'middle' }}
                  icon={<UserOutlined />}
                  size={36}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, lineHeight: 1.4 }}>
                    {user?.name || '未登录'}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', lineHeight: 1.4 }}>
                    {role ? ROLE_NAME_MAP[role] : ''}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
