import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Card, Table, Button, Space, Modal, Form, Input, InputNumber, DatePicker, TimePicker, Select, message, Tag } from 'antd';
import { RocketOutlined, ShoppingOutlined, UserOutlined, MessageOutlined, LogoutOutlined, HomeOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';
import { logout } from '../../store/slices/authSlice';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

const AdminFlights = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    setLoading(true);
    try {
      const response = await api.get('/flights');
      setFlights(response.data);
    } catch (error) {
      message.error('加载航班失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    const data = {
      ...values,
      departure_time: values.departure_date.format('YYYY-MM-DD') + ' ' + values.departure_time.format('HH:mm'),
      arrival_time: values.arrival_date.format('YYYY-MM-DD') + ' ' + values.arrival_time.format('HH:mm'),
    };
    delete data.departure_date;
    delete data.departure_time;
    delete data.arrival_date;
    delete data.arrival_time;

    try {
      if (editingFlight) {
        await api.put(`/admin/flights/${editingFlight.id}`, data);
        message.success('航班更新成功');
      } else {
        await api.post('/admin/flights', data);
        message.success('航班添加成功');
      }
      setModalVisible(false);
      setEditingFlight(null);
      form.resetFields();
      loadFlights();
    } catch (error) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const handleEdit = (flight) => {
    setEditingFlight(flight);
    form.setFieldsValue({
      ...flight,
      departure_date: dayjs(flight.departure_time),
      departure_time: dayjs(flight.departure_time),
      arrival_date: dayjs(flight.arrival_time),
      arrival_time: dayjs(flight.arrival_time),
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个航班吗？此操作不可恢复。',
      onOk: async () => {
        try {
          await api.delete(`/admin/flights/${id}`);
          message.success('删除成功');
          loadFlights();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const columns = [
    {
      title: '航班号',
      dataIndex: 'flight_number',
      key: 'flight_number',
    },
    {
      title: '航空公司',
      dataIndex: 'airline',
      key: 'airline',
    },
    {
      title: '航线',
      key: 'route',
      render: (_, record) => `${record.departure_city} → ${record.arrival_city}`,
    },
    {
      title: '起飞时间',
      key: 'departure',
      render: (_, record) => dayjs(record.departure_time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '到达时间',
      key: 'arrival',
      render: (_, record) => dayjs(record.arrival_time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '经济舱',
      key: 'economy',
      render: (_, record) => (
        <div>
          <div>¥{record.economy_price}</div>
          <div style={{ color: '#999', fontSize: 12 }}>剩余 {record.economy_seats} 张</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text) => (
        <Tag color={text === 'available' ? 'green' : 'red'}>
          {text === 'available' ? '可预订' : '不可用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
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
          defaultSelectedKeys={['/admin/flights']}
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
          <Card
            title="航班管理"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                setEditingFlight(null);
                form.resetFields();
                setModalVisible(true);
              }}>
                添加航班
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={flights}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Content>
      </Layout>

      <Modal
        title={editingFlight ? '编辑航班' : '添加航班'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingFlight(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item
                name="flight_number"
                label="航班号"
                rules={[{ required: true, message: '请输入航班号' }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="如：CA1234" />
              </Form.Item>
              <Form.Item
                name="airline"
                label="航空公司"
                rules={[{ required: true, message: '请输入航空公司' }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="如：中国国航" />
              </Form.Item>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item
                name="departure_city"
                label="出发城市"
                rules={[{ required: true, message: '请选择出发城市' }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="选择出发城市">
                  {['北京', '上海', '广州', '深圳', '杭州', '成都', '重庆', '西安', '南京', '武汉', '厦门', '青岛'].map(city => (
                    <Option key={city} value={city}>{city}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="arrival_city"
                label="到达城市"
                rules={[{ required: true, message: '请选择到达城市' }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="选择到达城市">
                  {['北京', '上海', '广州', '深圳', '杭州', '成都', '重庆', '西安', '南京', '武汉', '厦门', '青岛'].map(city => (
                    <Option key={city} value={city}>{city}</Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item
                name="departure_date"
                label="起飞日期"
                rules={[{ required: true, message: '请选择起飞日期' }]}
                style={{ flex: 1 }}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
              <Form.Item
                name="departure_time"
                label="起飞时间"
                rules={[{ required: true, message: '请选择起飞时间' }]}
                style={{ flex: 1 }}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item
                name="arrival_date"
                label="到达日期"
                rules={[{ required: true, message: '请选择到达日期' }]}
                style={{ flex: 1 }}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
              <Form.Item
                name="arrival_time"
                label="到达时间"
                rules={[{ required: true, message: '请选择到达时间' }]}
                style={{ flex: 1 }}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item
                name="economy_price"
                label="经济舱价格"
                rules={[{ required: true, message: '请输入经济舱价格' }]}
                style={{ flex: 1 }}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入价格" />
              </Form.Item>
              <Form.Item
                name="economy_seats"
                label="经济舱座位数"
                initialValue={150}
                style={{ flex: 1 }}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="默认150" />
              </Form.Item>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item name="business_price" label="商务舱价格" style={{ flex: 1 }}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="可选" />
              </Form.Item>
              <Form.Item name="business_seats" label="商务舱座位数" initialValue={50} style={{ flex: 1 }}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="默认50" />
              </Form.Item>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item name="first_class_price" label="头等舱价格" style={{ flex: 1 }}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="可选" />
              </Form.Item>
              <Form.Item name="first_class_seats" label="头等舱座位数" initialValue={20} style={{ flex: 1 }}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="默认20" />
              </Form.Item>
            </div>
            <Form.Item name="aircraft" label="机型">
              <Input placeholder="如：波音737、空客A320" />
            </Form.Item>
            <Form.Item name="status" label="状态" initialValue="available">
              <Select>
                <Option value="available">可预订</Option>
                <Option value="unavailable">不可用</Option>
              </Select>
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminFlights;
