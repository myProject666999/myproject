import React, { useState, useEffect } from 'react';
import { Carousel, Row, Col, Card, List, Button, Tag, Space } from 'antd';
import { EyeOutlined, BookOutlined, BulbOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import request from '../../utils/request';

const { Meta } = Card;

function Home() {
  const navigate = useNavigate();
  const [carousels, setCarousels] = useState([]);
  const [courses, setCourses] = useState([]);
  const [news, setNews] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [carouselRes, courseRes, newsRes, noticeRes] = await Promise.all([
        request.get('/carousels'),
        request.get('/courses?page_size=4'),
        request.get('/news?page_size=5'),
        request.get('/notices?page_size=5'),
      ]);
      
      setCarousels(carouselRes.data || []);
      setCourses(courseRes.data?.list || []);
      setNews(newsRes.data?.list || []);
      setNotices(noticeRes.data?.list || []);
    } catch (error) {
      console.error('加载数据失败', error);
    }
  };

  return (
    <div>
      {carousels.length > 0 && (
        <Carousel autoplay style={{ marginBottom: 24, borderRadius: 8, overflow: 'hidden' }}>
          {carousels.map((item) => (
            <div key={item.id} style={{ position: 'relative', height: 300 }}>
              <img 
                src={item.image} 
                alt={item.title} 
                style={{ width: '100%', height: 300, objectFit: 'cover' }}
              />
              <div style={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                padding: 20,
                color: '#fff'
              }}>
                <h2>{item.title}</h2>
              </div>
            </div>
          ))}
        </Carousel>
      )}

      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>
            <PlayCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            热门课程推荐
          </h2>
          <Button type="link" onClick={() => navigate('/courses')}>查看更多</Button>
        </div>
        <Row gutter={[16, 16]}>
          {courses.map((course) => (
            <Col span={6} key={course.id}>
              <Card
                hoverable
                cover={<img alt={course.title} src={course.cover} style={{ height: 180, objectFit: 'cover' }} />}
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <Meta 
                  title={course.title} 
                  description={
                    <Space>
                      <Tag color="blue">{course.teacher}</Tag>
                      <span><EyeOutlined /> {course.views}</span>
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <Row gutter={24}>
        <Col span={12}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>
              <BookOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              最新新闻
            </h2>
          </div>
          <List
            itemLayout="horizontal"
            dataSource={news}
            renderItem={(item) => (
              <List.Item 
                style={{ cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}
              >
                <List.Item.Meta
                  title={<a onClick={() => navigate(`/news/${item.id}`)}>{item.title}</a>}
                  description={new Date(item.created_at).toLocaleDateString()}
                />
                <Tag color="blue">{item.views} 阅读</Tag>
              </List.Item>
            )}
          />
        </Col>
        <Col span={12}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>
              <BulbOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              通知公告
            </h2>
          </div>
          <List
            itemLayout="horizontal"
            dataSource={notices}
            renderItem={(item) => (
              <List.Item 
                style={{ cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}
              >
                <List.Item.Meta
                  title={<a onClick={() => navigate(`/notices/${item.id}`)}>{item.title}</a>}
                  description={new Date(item.created_at).toLocaleDateString()}
                />
                <Tag color="orange">{item.views} 阅读</Tag>
              </List.Item>
            )}
          />
        </Col>
      </Row>
    </div>
  );
}

export default Home;
