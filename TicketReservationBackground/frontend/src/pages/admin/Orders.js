import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Card, Table, Button, Space, message, Tag } from 'antd';
import { RocketOutlined, ShoppingOutlined, UserOutlined, MessageOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';
import { logout } from '../../store/slices/authSlice';

const { Header, Sider, Content } = Layout;

const AdminOrders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data);
    } catch (error) {
      message.error('加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'order_number',
      key: 'order_number',
    },
    {
      title: '用户',
      key: 'user',
      render: (_, record) => record.user?.name || record.user?.username,
    },
    {
      title: '航班信息',
      key: 'flight',
      render: (_, record) => (
        <div>
          <div>{record.flight?.airline} {record.flight?.flight_number}</div>
          <div style={{ color: '#999', fontSize: 12 }}>
            {record.flight?.departure_city} → {record.flight?.arrival_city}
          </div>
        </div>
      ),
    },
    {
      title: '起飞时间',
      key: 'departure',
      render: (_, record) => dayjs(record.flight?.departure_time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '舱位',
      dataIndex: 'seat_class',
      key: 'seat_class',
      render: (text) => {
        const map = { economy: '经济舱', business: '商务舱', first_class: '头等舱' };
        return map[text] || text;
      },
    },
    {
      title: '乘机人',
      dataIndex: 'passenger_name',
      key: 'passenger_name',
    },
    {
      title: '金额',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (text) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{text}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text) => {
        const colorMap = { pending: 'orange', confirmed: 'green', cancelled: 'red' };
        const textMap = { pending: '待确认', confirmed: '已确认', cancelled: '已取消' };
        return <Tag color={colorMap[text]}>{textMap[text] || text}</Tag>;
      },
    },
    {
      title: '下单时间',
      key: 'created_at',
      render: (_, record) => dayjs(record.created_at).format('YYYY-MM-DD HH:mm'),
    },
  ];

  const menuItems = [
    { key: '/admin', icon: <HomeOutlined />, label: '仪表盘', onClick: () => navigate('/admin') },
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
          defaultSelectedKeys={['/admin/orders']}
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
          <Card title="订单管理">
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminOrders;
