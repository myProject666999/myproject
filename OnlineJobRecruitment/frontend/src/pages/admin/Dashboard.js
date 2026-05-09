import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  AuditOutlined,
  FileTextOutlined,
  BookOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { dashboardApi } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    user_count: 0,
    recruiter_count: 0,
    job_count: 0,
    application_count: 0,
    news_count: 0,
    exercise_count: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>系统概览</h2>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="注册用户数"
              value={stats.user_count}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="招聘人员数"
              value={stats.recruiter_count}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="职位数量"
              value={stats.job_count}
              prefix={<AuditOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="投递记录数"
              value={stats.application_count}
              prefix={<FileTextOutlined style={{ color: '#eb2f96' }} />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="资讯数量"
              value={stats.news_count}
              prefix={<MessageOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="练习题数量"
              value={stats.exercise_count}
              prefix={<BookOutlined style={{ color: '#13c2c2' }} />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
