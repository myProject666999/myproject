import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Card, Row, Col, Statistic, Button, Space, message } from 'antd';
import { DashboardOutlined, RocketOutlined, ShoppingOutlined, UserOutlined, MessageOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { logout } from '../../store/slices/authSlice';

const { Header, Sider, Content } = Layout;

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    flights: 0,
    orders: 0,
    users: 0,
    comments: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [flightsRes, ordersRes, usersRes, commentsRes] = await Promise.all([
        api.get('/flights'),
        api.get('/admin/orders'),
        api.get('/admin/users'),
        api.get('/admin/comments'),
      ]);
      setStats({
        flights: flightsRes.data.length,
        orders: ordersRes.data.length,
        users: usersRes.data.length,
        comments: commentsRes.data.length,
      });
    } catch (error) {
      message.error('加载统计数据失败');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { key: '/admin', icon: <DashboardOutlined />, label: '仪表盘', onClick: () => navigate('/admin') },
    { key: '/admin/flights', icon: <RocketOutlined />, label: '航班管理', onClick: () => navigate('/admin/flights') },
    { key: '/admin/orders', icon: <ShoppingOutlined />, label: '订单管理', onClick: () => navigate('/admin/orders') },
    { key: '/admin/users', icon: <UserOutlined />, label: '用户管理', onClick: () => navigate('/admin/users') },
    { key: '/admin/comments', icon: <MessageOutlined />, label: '留言管理', onClick: () => navigate('/admin/comments') },
  ];

  return (
    <Layout className="admin-layout">
      <Sider width={200} theme="dark">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 'bold' }}>
          <RocketOutlined style={{ marginRight: 8 }} />
          管理后台
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/admin']}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <Space>
            <Button type="primary" icon={<HomeOutlined />} onClick={() => navigate('/')}>
              返回前台
            </Button>
          </Space>
          <Space>
            <span>欢迎，{user?.name || user?.username}</span>
            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} style={{ color: 'white' }}>
              退出
            </Button>
          </Space>
        </Header>
        <Content className="admin-content">
          <h2 style={{ marginBottom: 24 }}>数据概览</h2>
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="航班总数"
                  value={stats.flights}
                  prefix={<RocketOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="订单总数"
                  value={stats.orders}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="注册用户"
                  value={stats.users}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="留言评论"
                  value={stats.comments}
                  prefix={<MessageOutlined />}
                  valueStyle={{ color: '#eb2f96' }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="快捷操作" style={{ marginTop: 24 }}>
            <Space>
              <Button type="primary" onClick={() => navigate('/admin/flights')}>管理航班</Button>
              <Button onClick={() => navigate('/admin/orders')}>查看订单</Button>
              <Button onClick={() => navigate('/admin/users')}>管理用户</Button>
              <Button onClick={() => navigate('/admin/comments')}>审核留言</Button>
            </Space>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
