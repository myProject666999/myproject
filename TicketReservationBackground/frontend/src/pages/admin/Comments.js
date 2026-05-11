import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Card, Table, Button, Space, message, Modal, Rate, Tag, Avatar, Typography } from 'antd';
import { RocketOutlined, ShoppingOutlined, UserOutlined, MessageOutlined, LogoutOutlined, HomeOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';
import { logout } from '../../store/slices/authSlice';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminComments = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/comments');
      setComments(response.data);
    } catch (error) {
      message.error('加载留言失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条留言吗？',
      onOk: async () => {
        try {
          await api.delete(`/admin/comments/${id}`);
          message.success('删除成功');
          loadComments();
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

  const typeMap = {
    general: '综合评价',
    service: '服务评价',
    suggestion: '意见建议',
    other: '其他',
  };

  const typeColorMap = {
    general: 'blue',
    service: 'green',
    suggestion: 'orange',
    other: 'default',
  };

  const columns = [
    {
      title: '用户',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div><Text strong>{record.user?.name || record.user?.username}</Text></div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.user?.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '留言内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 300,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (text) => (
        <Tag color={typeColorMap[text]}>{typeMap[text] || text}</Tag>
      ),
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      render: (text) => <Rate disabled defaultValue={text} />,
    },
    {
      title: '关联航班',
      key: 'flight',
      render: (_, record) => record.flight?.flight_number || '-',
    },
    {
      title: '时间',
      key: 'created_at',
      render: (_, record) => dayjs(record.created_at).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id)}
        >
          删除
        </Button>
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
          defaultSelectedKeys={['/admin/comments']}
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
          <Card title="留言管理">
            <Table
              columns={columns}
              dataSource={comments}
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

export default AdminComments;
