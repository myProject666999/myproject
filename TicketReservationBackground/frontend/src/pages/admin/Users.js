import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Card, Table, Button, Space, message, Modal, Tag } from 'antd';
import { RocketOutlined, ShoppingOutlined, UserOutlined, MessageOutlined, LogoutOutlined, HomeOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';
import { logout } from '../../store/slices/authSlice';

const { Header, Sider, Content } = Layout;

const AdminUsers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      message.error('加载用户失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？',
      onOk: async () => {
        try {
          await api.delete(`/admin/users/${id}`);
          message.success('删除成功');
          loadUsers();
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
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text) => text || '-',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => text || '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (text) => {
        const colorMap = { user: 'blue', admin: 'red' };
        const textMap = { user: '普通用户', admin: '管理员' };
        return <Tag color={colorMap[text]}>{textMap[text] || text}</Tag>;
      },
    },
    {
      title: '注册时间',
      key: 'created_at',
      render: (_, record) => dayjs(record.created_at).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            disabled={record.role === 'admin'}
          >
            删除
          </Button>
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
          defaultSelectedKeys={['/admin/users']}
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
          <Card title="用户管理">
            <Table
              columns={columns}
              dataSource={users}
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

export default AdminUsers;
