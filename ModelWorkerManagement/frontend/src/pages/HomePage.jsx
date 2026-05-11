import { useState, useEffect } from 'react';
import { Carousel, Card, List, Button, Tag, Row, Col, Typography, Space, message } from 'antd';
import { CalendarOutlined, EyeOutlined, ArrowRightOutlined, BellOutlined, BookOutlined, MessageOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { bannerAPI, announcementAPI, trainingAPI, forumAPI } from '../api';

const { Title, Text } = Typography;

function HomePage() {
  const [banners, setBanners] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bannerRes, announcementRes, trainingRes, postRes] = await Promise.all([
        bannerAPI.getAll(),
        announcementAPI.getAll(),
        trainingAPI.getAll(),
        forumAPI.getAll(),
      ]);
      setBanners(bannerRes.data);
      setAnnouncements(announcementRes.data.slice(0, 5));
      setTrainings(trainingRes.data.slice(0, 4));
      setPosts(postRes.data.slice(0, 5));
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <Carousel autoplay style={{ marginBottom: 32, borderRadius: 8, overflow: 'hidden' }}>
        {banners.map((banner) => (
          <div key={banner.id}>
            <img
              src={banner.image_url}
              alt={banner.title}
              style={{ width: '100%', height: 400, objectFit: 'cover' }}
            />
          </div>
        ))}
      </Carousel>

      <Row gutter={24}>
        <Col span={16}>
          <Card
            title={
              <Space>
                <BellOutlined style={{ color: '#1890ff' }} />
                <Title level={4} style={{ margin: 0 }}>系统公告</Title>
              </Space>
            }
            extra={
              <Button type="link" onClick={() => navigate('/announcements')}>
                查看更多 <ArrowRightOutlined />
              </Button>
            }
            style={{ marginBottom: 24 }}
          >
            <List
              dataSource={announcements}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Text type="secondary" key="date">
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <a onClick={() => navigate('/announcements/' + item.id)} style={{ cursor: 'pointer' }}>
                        {item.title}
                      </a>
                    }
                    description={
                      <Text ellipsis style={{ display: 'block', maxWidth: 600 }}>
                        {item.content}
                      </Text>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: '暂无公告' }}
            />
          </Card>

          <Card
            title={
              <Space>
                <MessageOutlined style={{ color: '#52c41a' }} />
                <Title level={4} style={{ margin: 0 }}>最新帖子</Title>
              </Space>
            }
            extra={
              <Button type="link" onClick={() => navigate('/forum')}>
                查看更多 <ArrowRightOutlined />
              </Button>
            }
          >
            <List
              dataSource={posts}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Text type="secondary" key="author">
                      {item.username}
                    </Text>,
                    <Text type="secondary" key="date">
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <a onClick={() => navigate('/forum/' + item.id)} style={{ cursor: 'pointer' }}>
                        {item.title}
                      </a>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: '暂无帖子' }}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card
            title={
              <Space>
                <BookOutlined style={{ color: '#722ed1' }} />
                <Title level={4} style={{ margin: 0 }}>热门培训</Title>
              </Space>
            }
            extra={
              <Button type="link" onClick={() => navigate('/trainings')}>
                查看更多 <ArrowRightOutlined />
              </Button>
            }
          >
            <List
              grid={{ gutter: 16, column: 1 }}
              dataSource={trainings}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    hoverable
                    size="small"
                    cover={
                      <img
                        alt={item.title}
                        src={item.image_url}
                        style={{ height: 150, objectFit: 'cover' }}
                        onClick={() => navigate('/trainings/' + item.id)}
                      />
                    }
                    actions={[
                      <Button type="link" onClick={() => navigate('/trainings/' + item.id)}>
                        <EyeOutlined /> 查看详情
                      </Button>,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Text strong ellipsis style={{ display: 'block' }}>
                          {item.title}
                        </Text>
                      }
                      description={
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <div>
                            <CalendarOutlined style={{ marginRight: 4 }} />
                            {item.start_date}
                          </div>
                          <Tag color={item.current_enroll < item.max_enroll ? 'green' : 'red'}>
                            {item.current_enroll}/{item.max_enroll} 人
                          </Tag>
                        </Space>
                      }
                    />
                  </Card>
                </List.Item>
              )}
              locale={{ emptyText: '暂无培训' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default HomePage;
