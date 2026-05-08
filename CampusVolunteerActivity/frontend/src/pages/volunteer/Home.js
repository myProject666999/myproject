import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Carousel, Typography, Space, Tag, Button, message } from 'antd';
import { CalendarOutlined, UserOutlined, TrophyOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { carouselApi, activityApi, volunteerApi } from '../../utils/api';

const { Title, Paragraph } = Typography;

const Home = () => {
  const [carousels, setCarousels] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [excellentVolunteers, setExcellentVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [carouselRes, activityRes, volunteerRes] = await Promise.all([
        carouselApi.getList(),
        activityApi.getList({ page: 1, page_size: 6, status: 'active' }),
        volunteerApi.getExcellent(),
      ]);
      setCarousels(carouselRes.data);
      setRecentActivities(activityRes.data.list || []);
      setExcellentVolunteers(volunteerRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div>
      {carousels.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <Carousel autoplay dotPosition="bottom">
            {carousels.map((item) => (
              <div key={item.id} className="carousel-item">
                <img
                  src={item.image_url}
                  alt={item.title}
                  style={{ width: '100%', height: 300, objectFit: 'cover' }}
                />
              </div>
            ))}
          </Carousel>
        </Card>
      )}

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card className="stat-card">
            <Space direction="vertical" size="middle">
              <CalendarOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>志愿活动</Title>
                <Paragraph style={{ color: '#666', margin: 0 }}>参与丰富多彩的志愿活动</Paragraph>
              </div>
              <Button type="primary" onClick={() => navigate('/activities')}>
                查看活动 <ArrowRightOutlined />
              </Button>
            </Space>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="stat-card">
            <Space direction="vertical" size="middle">
              <TrophyOutlined style={{ fontSize: 48, color: '#faad14' }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>积分兑换</Title>
                <Paragraph style={{ color: '#666', margin: 0 }}>参与活动获取积分</Paragraph>
              </div>
              <Button type="primary" onClick={() => navigate('/points')}>
                查看积分 <ArrowRightOutlined />
              </Button>
            </Space>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="stat-card">
            <Space direction="vertical" size="middle">
              <UserOutlined style={{ fontSize: 48, color: '#52c41a' }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>优秀志愿者</Title>
                <Paragraph style={{ color: '#666', margin: 0 }}>向优秀志愿者学习</Paragraph>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card
        title="最新活动"
        extra={
          <Button type="link" onClick={() => navigate('/activities')}>
            查看全部 <ArrowRightOutlined />
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          {recentActivities.map((activity) => (
            <Col span={8} key={activity.id}>
              <Card
                hoverable
                className="activity-card"
                onClick={() => navigate(`/activities/${activity.id}`)}
              >
                {activity.cover_image && (
                  <div style={{ height: 150, marginBottom: 12 }}>
                    <img
                      src={activity.cover_image}
                      alt={activity.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <Title level={5} ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                  {activity.title}
                </Title>
                <Space size="middle">
                  {getStatusTag(activity.status)}
                  <span>积分: {activity.points}</span>
                </Space>
                <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#666', marginTop: 8 }}>
                  {activity.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="优秀志愿者">
        <Row gutter={16}>
          {excellentVolunteers.map((volunteer) => (
            <Col span={6} key={volunteer.id}>
              <Card style={{ textAlign: 'center' }}>
                <UserOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                <Title level={5} style={{ marginTop: 12, marginBottom: 4 }}>
                  {volunteer.real_name || volunteer.username}
                </Title>
                <Tag color="gold">优秀志愿者</Tag>
                <Paragraph style={{ marginTop: 8 }}>
                  积分: {volunteer.points}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default Home;
