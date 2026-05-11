import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, message, Table, Tag, Space, Button } from 'antd';
import { UserOutlined, BookOutlined, BellOutlined, MessageOutlined, EyeOutlined } from '@ant-design/icons';
import { adminAPI, trainingAPI, announcementAPI, forumAPI } from '../../api';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentTrainings, setRecentTrainings] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, trainingsRes, announcementsRes, postsRes] = await Promise.all([
        adminAPI.getStats(),
        trainingAPI.getAll(),
        announcementAPI.getAll(),
        forumAPI.getAll(),
      ]);
      setStats(statsRes.data);
      setRecentTrainings(trainingsRes.data.slice(0, 5));
      setRecentAnnouncements(announcementsRes.data.slice(0, 5));
      setRecentPosts(postsRes.data.slice(0, 5));
    } catch (error) {
      message.error('获取数据失败');
    }
  };

  const trainingColumns = [
    { title: '培训名称', dataIndex: 'title', key: 'title' },
    { title: '开始时间', dataIndex: 'start_date', key: 'start_date' },
    { title: '报名人数', dataIndex: 'current_enroll', key: 'current_enroll' },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '进行中' : '已结束'}
        </Tag>
      ),
    },
  ];

  const announcementColumns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '作者', dataIndex: 'author', key: 'author' },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const postColumns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '作者', dataIndex: 'username', key: 'username' },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>系统概览</h1>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="注册用户数"
              value={stats?.user_count || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="培训课程数"
              value={stats?.training_count || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="系统公告数"
              value={stats?.announcement_count || 0}
              prefix={<BellOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="论坛帖子数"
              value={stats?.post_count || 0}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="最近培训" style={{ marginBottom: 16 }}>
            <Table
              dataSource={recentTrainings}
              columns={trainingColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最近公告" style={{ marginBottom: 16 }}>
            <Table
              dataSource={recentAnnouncements}
              columns={announcementColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Card title="最近论坛帖子">
        <Table
          dataSource={recentPosts}
          columns={postColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
}

export default AdminDashboard;
