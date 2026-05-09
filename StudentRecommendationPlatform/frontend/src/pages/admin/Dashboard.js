import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Space } from 'antd';
import { BookOutlined, PlayCircleOutlined, BulbOutlined, UserOutlined, TeamOutlined, MessageOutlined, FileTextOutlined } from '@ant-design/icons';
import request from '../../utils/request';

function Dashboard() {
  const [stats, setStats] = useState({
    books: 0,
    courses: 0,
    knowledge: 0,
    users: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [booksRes, coursesRes, knowledgeRes, usersRes] = await Promise.all([
        request.get('/admin/books?page_size=1'),
        request.get('/admin/courses?page_size=1'),
        request.get('/admin/knowledge-points?page_size=1'),
        request.get('/admin/front-users?page_size=1'),
      ]);

      setStats({
        books: booksRes.data?.total || 0,
        courses: coursesRes.data?.total || 0,
        knowledge: knowledgeRes.data?.total || 0,
        users: usersRes.data?.total || 0,
      });
    } catch (error) {
      console.error('加载统计数据失败', error);
    }
  };

  return (
    <div>
      <h2>数据概览</h2>
      
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="书籍总数"
              value={stats.books}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="课程总数"
              value={stats.courses}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="知识点总数"
              value={stats.knowledge}
              prefix={<BulbOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="注册用户"
              value={stats.users}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
