import React, { useState, useEffect } from 'react';
import {
  Layout, Menu, Table, Button, Space, Card, Tag,
  Modal, Form, Input, InputNumber, message, Tabs, Statistic,
  Row, Col
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined,
  UserOutlined, MessageOutlined, TrophyOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  messageApi, userApi, lotteryApi
} from '../services/api';

const { Header, Content, Sider } = Layout;

const AdminPage = () => {
  const navigate = useNavigate();
  const [pendingMessages, setPendingMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [lotteries, setLotteries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lotteryModalVisible, setLotteryModalVisible] = useState(false);
  const [winners, setWinners] = useState([]);
  const [selectedLottery, setSelectedLottery] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    if (!adminId) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = () => {
    fetchPendingMessages();
    fetchAllMessages();
    fetchUsers();
    fetchLotteries();
  };

  const fetchPendingMessages = async () => {
    try {
      const response = await messageApi.getPending();
      setPendingMessages(response.data.messages || []);
    } catch (error) {
      console.error('Failed to fetch pending messages:', error);
    }
  };

  const fetchAllMessages = async () => {
    try {
      const response = await messageApi.getAll({ limit: 50 });
      setAllMessages(response.data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userApi.getUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchLotteries = async () => {
    try {
      const response = await lotteryApi.getAll();
      setLotteries(response.data.lotteries || []);
    } catch (error) {
      console.error('Failed to fetch lotteries:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await messageApi.approve(id);
      message.success('审核通过');
      fetchData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleReject = async (id) => {
    try {
      await messageApi.reject(id);
      message.success('已拒绝');
      fetchData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleCreateLottery = async () => {
    try {
      const values = await form.validateFields();
      await lotteryApi.create(values);
      message.success('抽奖活动创建成功');
      setLotteryModalVisible(false);
      form.resetFields();
      fetchLotteries();
    } catch (error) {
      message.error('创建失败');
    }
  };

  const handleDraw = async (lottery) => {
    setSelectedLottery(lottery);
    try {
      const response = await lotteryApi.draw(lottery.id);
      setWinners(response.data.winners || []);
      Modal.success({
        title: '🎉 抽奖结果',
        content: (
          <div>
            <p>活动: {lottery.activity_name}</p>
            <p>奖品: {lottery.prize_name}</p>
            <h3>中奖名单:</h3>
            {response.data.winners?.map((winner, index) => (
              <p key={index} style={{ fontSize: 18, color: '#ff6b6b' }}>
                {index + 1}. {winner.nickname}
              </p>
            ))}
          </div>
        ),
      });
      fetchLotteries();
    } catch (error) {
      message.error('抽奖失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminId');
    navigate('/admin/login');
  };

  const pendingColumns = [
    {
      title: '用户',
      dataIndex: ['user', 'nickname'],
      key: 'user',
      width: 150,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: '敏感词',
      dataIndex: 'is_sensitive',
      key: 'is_sensitive',
      width: 100,
      render: (val) => (
        <Tag color={val ? 'red' : 'green'}>
          {val ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleApprove(record.id)}
          >
            通过
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseCircleOutlined />}
            onClick={() => handleReject(record.id)}
          >
            拒绝
          </Button>
        </Space>
      ),
    },
  ];

  const messageColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户',
      dataIndex: ['user', 'nickname'],
      key: 'user',
      width: 120,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const colors = ['orange', 'green', 'red'];
        const texts = ['待审核', '已通过', '已拒绝'];
        return <Tag color={colors[status]}>{texts[status]}</Tag>;
      },
    },
    {
      title: '点赞',
      dataIndex: 'likes',
      key: 'likes',
      width: 80,
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
    },
  ];

  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
  ];

  const lotteryColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '活动名称',
      dataIndex: 'activity_name',
      key: 'activity_name',
    },
    {
      title: '奖品',
      dataIndex: 'prize_name',
      key: 'prize_name',
    },
    {
      title: '中奖人数',
      dataIndex: 'winner_count',
      key: 'winner_count',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const colors = ['blue', 'orange', 'green'];
        const texts = ['未开始', '进行中', '已结束'];
        return <Tag color={colors[status]}>{texts[status]}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<TrophyOutlined />}
          disabled={record.status === 2}
          onClick={() => handleDraw(record)}
        >
          抽奖
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div
          style={{
            height: 64,
            margin: 16,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
          }}
        >
          弹幕管理后台
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<MessageOutlined />}>
            消息管理
          </Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />}>
            用户管理
          </Menu.Item>
          <Menu.Item key="3" icon={<TrophyOutlined />}>
            抽奖管理
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0 }}>管理后台</h2>
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            退出登录
          </Button>
        </Header>
        <Content style={{ margin: '24px 16px' }}>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="待审核消息"
                  value={pendingMessages.length}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="总消息数"
                  value={allMessages.length}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="注册用户"
                  value={users.length}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="抽奖活动"
                  value={lotteries.length}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: '消息审核',
                children: (
                  <Card
                    title={`待审核消息 (${pendingMessages.length})`}
                    extra={
                      <Button onClick={fetchPendingMessages}>刷新</Button>
                    }
                  >
                    <Table
                      columns={pendingColumns}
                      dataSource={pendingMessages}
                      rowKey="id"
                      loading={loading}
                      size="middle"
                    />
                  </Card>
                ),
              },
              {
                key: '2',
                label: '所有消息',
                children: (
                  <Card
                    title="所有消息"
                    extra={<Button onClick={fetchAllMessages}>刷新</Button>}
                  >
                    <Table
                      columns={messageColumns}
                      dataSource={allMessages}
                      rowKey="id"
                      loading={loading}
                      size="middle"
                      pagination={{ pageSize: 10 }}
                    />
                  </Card>
                ),
              },
              {
                key: '3',
                label: '用户管理',
                children: (
                  <Card
                    title="用户列表"
                    extra={<Button onClick={fetchUsers}>刷新</Button>}
                  >
                    <Table
                      columns={userColumns}
                      dataSource={users}
                      rowKey="id"
                      loading={loading}
                      size="middle"
                    />
                  </Card>
                ),
              },
              {
                key: '4',
                label: '抽奖管理',
                children: (
                  <Card
                    title="抽奖活动"
                    extra={
                      <Button
                        type="primary"
                        icon={<TrophyOutlined />}
                        onClick={() => setLotteryModalVisible(true)}
                      >
                        创建活动
                      </Button>
                    }
                  >
                    <Table
                      columns={lotteryColumns}
                      dataSource={lotteries}
                      rowKey="id"
                      loading={loading}
                      size="middle"
                    />
                  </Card>
                ),
              },
            ]}
          />
        </Content>
      </Layout>

      <Modal
        title="创建抽奖活动"
        open={lotteryModalVisible}
        onCancel={() => setLotteryModalVisible(false)}
        onOk={handleCreateLottery}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="activity_name"
            label="活动名称"
            rules={[{ required: true, message: '请输入活动名称' }]}
          >
            <Input placeholder="请输入活动名称" />
          </Form.Item>
          <Form.Item
            name="prize_name"
            label="奖品名称"
            rules={[{ required: true, message: '请输入奖品名称' }]}
          >
            <Input placeholder="请输入奖品名称" />
          </Form.Item>
          <Form.Item
            name="winner_count"
            label="中奖人数"
            rules={[{ required: true, message: '请输入中奖人数' }]}
          >
            <InputNumber min={1} max={100} placeholder="请输入中奖人数" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminPage;
