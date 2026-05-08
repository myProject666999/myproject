import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  CrownOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { statsApi } from '../../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await statsApi.getStats();
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日发布活动"
              value={stats?.daily_activities || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月发布活动"
              value={stats?.monthly_activities || 0}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#722ed1' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="历史发布活动"
              value={stats?.total_activities || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#13c2c2' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="志愿者总数"
              value={stats?.total_volunteers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="优秀志愿者">
            <Statistic
              value={stats?.excellent_volunteers || 0}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#faad14' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="进行中的活动">
            <Statistic
              value={stats?.pending_activities || 0}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#eb2f96' }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
