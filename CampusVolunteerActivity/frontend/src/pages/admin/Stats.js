import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  CrownOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { statsApi, volunteerApi } from '../../utils/api';
import dayjs from 'dayjs';

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [topVolunteers, setTopVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, trendRes, volunteersRes] = await Promise.all([
        statsApi.getStats(),
        statsApi.getTrend(),
        volunteerApi.getList({ page: 1, page_size: 10 }),
      ]);
      setStats(statsRes.data);
      setTrend(trendRes.data || []);
      setTopVolunteers(volunteersRes.data.list?.slice(0, 5) || []);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const trendColumns = [
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: '活动数量',
      dataIndex: 'count',
      key: 'count',
      render: (count) => <Tag color="blue">{count} 个</Tag>,
    },
  ];

  const volunteerColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      render: (_, __, index) => {
        const colors = ['gold', 'orange', 'blue', 'purple', 'default'];
        return <Tag color={colors[index]}>{index + 1}</Tag>;
      },
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '真实姓名',
      dataIndex: 'real_name',
      key: 'real_name',
    },
    {
      title: '学院',
      dataIndex: 'college',
      key: 'college',
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      render: (points) => <Tag color="gold">{points}</Tag>,
    },
    {
      title: '优秀志愿者',
      dataIndex: 'is_excellent',
      key: 'is_excellent',
      render: (isExcellent) => (
        isExcellent ? <Tag color="gold" icon={<CrownOutlined />}>是</Tag> : <Tag>否</Tag>
      ),
    },
  ];

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
          <Card title="近6个月活动发布趋势">
            <Table
              columns={trendColumns}
              dataSource={trend}
              rowKey="month"
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="积分排行榜 Top 5">
            <Table
              columns={volunteerColumns}
              dataSource={topVolunteers}
              rowKey="id"
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Stats;
