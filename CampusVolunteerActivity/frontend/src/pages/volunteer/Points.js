import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Table, Tag, Timeline } from 'antd';
import { TrophyOutlined, UpOutlined } from '@ant-design/icons';
import { authApi } from '../../utils/api';
import dayjs from 'dayjs';

const Points = () => {
  const [pointsData, setPointsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      setLoading(true);
      const res = await authApi.getMyPoints();
      setPointsData(res.data);
    } catch (error) {
      console.error('Failed to fetch points:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const typeMap = {
          activity: { color: 'blue', text: '活动奖励' },
          bonus: { color: 'gold', text: '额外奖励' },
        };
        const info = typeMap[type] || { color: 'default', text: type };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      width: 100,
      render: (points) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          <UpOutlined /> +{points}
        </span>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="我的总积分"
              value={pointsData?.total_points || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="积分记录">
        <Table
          columns={columns}
          dataSource={pointsData?.records || []}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
        />
      </Card>
    </div>
  );
};

export default Points;
