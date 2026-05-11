import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Carousel, Button, Tag, Typography, Spin } from 'antd';
import { 
  BellOutlined, 
  InboxOutlined, 
  HeartOutlined, 
  SafetyCertificateOutlined,
  TeamOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { noticeAPI, materialAPI, knowledgeAPI, rumorAPI, recruitmentAPI } from '../utils/api';

const { Title, Paragraph } = Typography;

const carouselItems = [
  {
    id: 1,
    title: '应急互助，共渡难关',
    description: '在紧急时刻，我们一起携手，共同应对挑战',
    image: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=1200&h=400&fit=crop'
  },
  {
    id: 2,
    title: '物资共享，温暖传递',
    description: '闲置物资，帮助需要的人，传递爱心与希望',
    image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200&h=400&fit=crop'
  },
  {
    id: 3,
    title: '心理疏导，守护心灵',
    description: '专业的心理知识，帮助您度过困难时期',
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&h=400&fit=crop'
  }
];

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [rumors, setRumors] = useState([]);
  const [recruitments, setRecruitments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [noticeRes, materialRes, knowledgeRes, rumorRes, recruitmentRes] = await Promise.all([
          noticeAPI.getList({ page: 1, page_size: 4 }),
          materialAPI.getList({ page: 1, page_size: 4 }),
          knowledgeAPI.getList({ page: 1, page_size: 4 }),
          rumorAPI.getList({ page: 1, page_size: 4 }),
          recruitmentAPI.getList({ page: 1, page_size: 4 }),
        ]);
        setNotices(noticeRes.list || []);
        setMaterials(materialRes.list || []);
        setKnowledge(knowledgeRes.list || []);
        setRumors(rumorRes.list || []);
        setRecruitments(recruitmentRes.list || []);
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Carousel autoplay style={{ marginBottom: 32 }}>
        {carouselItems.map((item) => (
          <div key={item.id} style={{ position: 'relative', height: 400 }}>
            <div 
              style={{ 
                position: 'absolute', 
                inset: 0, 
                background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${item.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                borderRadius: 8
              }}
            >
              <Title level={2} style={{ color: '#fff', marginBottom: 16 }}>{item.title}</Title>
              <Paragraph style={{ color: '#fff', fontSize: 18, marginBottom: 24 }}>{item.description}</Paragraph>
              <Button type="primary" size="large" icon={<ArrowRightOutlined />}>
                了解更多
              </Button>
            </div>
          </div>
        ))}
      </Carousel>

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <BellOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
                <span>紧急通知</span>
              </div>
            }
            extra={<Link to="/notices">查看更多 <ArrowRightOutlined /></Link>}
          >
            <Row gutter={[16, 16]}>
              {notices.map((notice) => (
                <Col xs={24} sm={12} key={notice.id}>
                  <Link to={`/notices/${notice.id}`}>
                    <Card 
                      hoverable 
                      style={{ height: '100%' }}
                      bodyStyle={{ padding: 16 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Tag color="red">{notice.level || '一般'}</Tag>
                        <span style={{ color: '#999', fontSize: 12 }}>
                          {new Date(notice.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Title level={5} style={{ marginBottom: 8 }} ellipsis={{ rows: 2 }}>
                        {notice.title}
                      </Title>
                      <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                        {notice.summary || notice.content}
                      </Paragraph>
                    </Card>
                  </Link>
                </Col>
              ))}
              {notices.length === 0 && (
                <Col span={24} style={{ textAlign: 'center', color: '#999' }}>
                  暂无紧急通知
                </Col>
              )}
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <InboxOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                <span>物资信息</span>
              </div>
            }
            extra={<Link to="/materials">查看更多 <ArrowRightOutlined /></Link>}
          >
            {materials.map((material) => (
              <Link to={`/materials/${material.id}`} key={material.id}>
                <div style={{ 
                  padding: '12px 0', 
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{material.name}</div>
                    <div style={{ color: '#999', fontSize: 12 }}>
                      库存: {material.quantity} {material.unit}
                    </div>
                  </div>
                  <Tag color="blue">{material.category || '物资'}</Tag>
                </div>
              </Link>
            ))}
            {materials.length === 0 && (
              <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                暂无物资信息
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <HeartOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
                <span>心理知识</span>
              </div>
            }
            extra={<Link to="/knowledge">查看更多 <ArrowRightOutlined /></Link>}
          >
            {knowledge.map((item) => (
              <Link to={`/knowledge/${item.id}`} key={item.id}>
                <div style={{ 
                  padding: '12px 0', 
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ color: '#999', fontSize: 12 }}>
                      阅读: {item.views}次
                    </div>
                  </div>
                  <Tag color="pink">{item.category || '心理'}</Tag>
                </div>
              </Link>
            ))}
            {knowledge.length === 0 && (
              <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                暂无心理知识
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <SafetyCertificateOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                <span>辟谣专区</span>
              </div>
            }
            extra={<Link to="/rumors">查看更多 <ArrowRightOutlined /></Link>}
          >
            {rumors.map((rumor) => (
              <Link to={`/rumors/${rumor.id}`} key={rumor.id}>
                <div style={{ 
                  padding: '12px 0', 
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div style={{ fontWeight: 500 }}>{rumor.title}</div>
                </div>
              </Link>
            ))}
            {rumors.length === 0 && (
              <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                暂无辟谣信息
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TeamOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                <span>招募信息</span>
              </div>
            }
            extra={<Link to="/recruitments">查看更多 <ArrowRightOutlined /></Link>}
          >
            {recruitments.map((recruitment) => (
              <Link to={`/recruitments/${recruitment.id}`} key={recruitment.id}>
                <div style={{ 
                  padding: '12px 0', 
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{recruitment.title}</div>
                    <div style={{ color: '#999', fontSize: 12 }}>
                      {recruitment.position} · 招募{recruitment.number}人
                    </div>
                  </div>
                  <div style={{ color: '#999', fontSize: 12 }}>
                    👍 {recruitment.likes}
                  </div>
                </div>
              </Link>
            ))}
            {recruitments.length === 0 && (
              <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                暂无招募信息
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
