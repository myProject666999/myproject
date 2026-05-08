import React, { useState, useEffect } from 'react';
import { Input, Select, Card, Row, Col, Tag, Typography, Button, Space, Pagination, message, Modal } from 'antd';
import { SearchOutlined, CalendarOutlined, EnvironmentOutlined, ArrowRightOutlined, TrophyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { activityApi } from '../../utils/api';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, page_size: 9, total: 0 });
  const [filters, setFilters] = useState({ keyword: '', category: '', status: '' });
  const navigate = useNavigate();

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await activityApi.getList({
        ...pagination,
        ...filters,
      });
      setActivities(res.data.list || []);
      setPagination(prev => ({ ...prev, total: res.data.total }));
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [pagination.page, filters]);

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'orange', text: '待开始' },
      active: { color: 'green', text: '报名中' },
      ongoing: { color: 'blue', text: '进行中' },
      completed: { color: 'purple', text: '已完成' },
      cancelled: { color: 'red', text: '已取消' },
    };
    const info = statusMap[status] || { color: 'default', text: '未知' };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, keyword: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCategoryChange = (value) => {
    setFilters(prev => ({ ...prev, category: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = (value) => {
    setFilters(prev => ({ ...prev, status: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Space size="middle" style={{ width: '100%' }}>
          <Input.Search
            placeholder="搜索活动名称或描述"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            style={{ width: 300 }}
            onSearch={handleSearch}
          />
          <Select
            placeholder="选择分类"
            allowClear
            size="large"
            style={{ width: 150 }}
            onChange={handleCategoryChange}
          >
            <Option value="环保">环保</Option>
            <Option value="支教">支教</Option>
            <Option value="社区服务">社区服务</Option>
            <Option value="赛事服务">赛事服务</Option>
            <Option value="其他">其他</Option>
          </Select>
          <Select
            placeholder="选择状态"
            allowClear
            size="large"
            style={{ width: 150 }}
            onChange={handleStatusChange}
          >
            <Option value="active">报名中</Option>
            <Option value="ongoing">进行中</Option>
            <Option value="completed">已完成</Option>
          </Select>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {activities.map((activity) => (
          <Col span={8} key={activity.id}>
            <Card
              hoverable
              className="activity-card"
              loading={loading}
            >
              {activity.cover_image ? (
                <div style={{ height: 180, marginBottom: 12 }}>
                  <img
                    src={activity.cover_image}
                    alt={activity.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    height: 180,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                    color: 'white',
                  }}
                >
                  <CalendarOutlined style={{ fontSize: 48 }} />
                </div>
              )}
              <Title level={5} ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                {activity.title}
              </Title>
              <Space wrap size="small" style={{ marginBottom: 12 }}>
                {getStatusTag(activity.status)}
                <Tag icon={<TrophyOutlined />} color="gold">
                  {activity.points} 积分
                </Tag>
                <Tag>
                  {activity.current_participants}/{activity.max_participants} 人
                </Tag>
              </Space>
              <Space direction="vertical" size="small" style={{ marginBottom: 12 }}>
                <span style={{ color: '#666' }}>
                  <EnvironmentOutlined /> {activity.location}
                </span>
                <span style={{ color: '#666' }}>
                  <CalendarOutlined /> {dayjs(activity.start_date).format('YYYY-MM-DD')}
                </span>
              </Space>
              <Button
                type="primary"
                block
                onClick={() => navigate(`/activities/${activity.id}`)}
              >
                查看详情 <ArrowRightOutlined />
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      {activities.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination
            current={pagination.page}
            pageSize={pagination.page_size}
            total={pagination.total}
            showSizeChanger={false}
            onChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default Activities;
