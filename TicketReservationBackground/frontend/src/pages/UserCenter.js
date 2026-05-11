import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Menu, Card, Form, Input, Button, message, Space, Table, Typography, Tag, Descriptions } from 'antd';
import { UserOutlined, ShoppingCartOutlined, EditOutlined, HomeOutlined, LogoutOutlined, MessageOutlined, AppstoreOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';
import { logout, updateProfile } from '../store/slices/authSlice';

const { Header, Sider, Content, Footer } = Layout;
const { Title } = Typography;

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    }
  }, [user, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await dispatch(updateProfile(values)).unwrap();
      message.success('资料更新成功');
      setEditing(false);
    } catch (error) {
      message.error(error || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="个人资料">
      {!editing ? (
        <Descriptions column={1} bordered>
          <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
          <Descriptions.Item label="姓名">{user?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{user?.email}</Descriptions.Item>
          <Descriptions.Item label="手机号">{user?.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="注册时间">{dayjs(user?.created_at).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
        </Descriptions>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item name="name" label="姓名">
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '请输入有效邮箱' }]}>
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>保存</Button>
            <Button onClick={() => setEditing(false)}>取消</Button>
          </Space>
        </Form>
      )}
      {!editing && (
        <div style={{ marginTop: 16 }}>
          <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>编辑资料</Button>
        </div>
      )}
    </Card>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      message.error('加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'order_number',
      key: 'order_number',
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
      key: 'departure_time',
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

  return (
    <Card title="我的订单">
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

const UserCenter = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    message.success('已退出登录');
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/user/profile',
      icon: <UserOutlined />,
      label: <NavLink to="/user/profile">个人资料</NavLink>,
    },
    {
      key: '/user/orders',
      icon: <ShoppingCartOutlined />,
      label: <NavLink to="/user/orders">我的订单</NavLink>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 48 }}>
          <AppstoreOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 8 }} />
          <span style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>机票预订系统</span>
        </div>
        <Menu
          theme="light"
          mode="horizontal"
          items={[
            { key: 'home', icon: <HomeOutlined />, label: '首页', onClick: () => navigate('/') },
            { key: 'comments', icon: <MessageOutlined />, label: '留言评论', onClick: () => navigate('/comments') },
          ]}
          style={{ flex: 1, borderBottom: 'none' }}
        />
        <Space>
          <span style={{ color: '#666' }}>{user?.name || user?.username}</span>
          <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>退出</Button>
        </Space>
      </Header>

      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <div style={{ padding: 16, textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
            <UserOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            <div style={{ marginTop: 8, fontWeight: 'bold' }}>{user?.name || user?.username}</div>
            <div style={{ color: '#999', fontSize: 12 }}>{user?.email}</div>
          </div>
          <Menu
            mode="inline"
            defaultSelectedKeys={['/user/profile']}
            defaultOpenKeys={['sub1']}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>

        <Content style={{ padding: '24px', background: '#f0f2f5' }}>
          <Routes>
            <Route path="/" element={<Profile />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
          </Routes>
        </Content>
      </Layout>

      <Footer style={{ textAlign: 'center', background: '#001529', color: '#fff' }}>
        机票预订系统 ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default UserCenter;
