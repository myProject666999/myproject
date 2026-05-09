import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Carousel, Input, Button, Space, Tag, Typography, message } from 'antd';
import { ShoppingCartOutlined, SearchOutlined, BellOutlined, BookOutlined, GiftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { noticeAPI, advocateAPI, bagAPI, productAPI } from '../../services/api';

const { Title, Text } = Typography;

function HomePage() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [bags, setBags] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [noticesRes, advRes, bagsRes, productsRes] = await Promise.all([
        noticeAPI.getList({ page_size: 3 }),
        advocateAPI.getList({ page_size: 4 }),
        bagAPI.getList({ page_size: 4 }),
        productAPI.getList({ page_size: 4 })
      ]);
      setNotices(noticesRes.data.data?.list || []);
      setAdvocates(advRes.data.data?.list || []);
      setBags(bagsRes.data.data?.list || []);
      setProducts(productsRes.data.data?.list || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      navigate(`/bags?keyword=${encodeURIComponent(searchKeyword)}`);
    }
  };

  const carouselImages = [
    { title: '垃圾分类从我做起', desc: '共建绿色校园' },
    { title: '分类投放积分奖励', desc: '积分可兑换精美商品' },
    { title: '环保小卫士在行动', desc: '加入环保志愿者队伍' },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 24, padding: 0 }}>
        <Carousel autoplay style={{ height: 300 }}>
          {carouselImages.map((item, index) => (
            <div key={index} style={{ 
              height: 300, 
              background: `linear-gradient(135deg, ${index === 0 ? '#667eea' : index === 1 ? '#f093fb' : '#4facfe'} 0%, ${index === 0 ? '#764ba2' : index === 1 ? '#f5576c' : '#00f2fe'} 100%)`,
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center',
              color: 'white'
            }}>
              <Title level={2} style={{ color: 'white', marginBottom: 8 }}>{item.title}</Title>
              <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)' }}>{item.desc}</Text>
            </div>
          ))}
        </Carousel>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={16}>
            <Input 
              size="large" 
              placeholder="搜索垃圾袋..." 
              prefix={<SearchOutlined />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col span={8}>
            <Button type="primary" size="large" block onClick={handleSearch}>
              <SearchOutlined /> 搜索垃圾袋
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={24}>
        <Col span={16}>
          <Card 
            title={<span><BellOutlined style={{ marginRight: 8 }} />最新公告</span>}
            style={{ marginBottom: 24 }}
            extra={<a onClick={() => navigate('/notices')}>更多</a>}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {notices.map(notice => (
                <div 
                  key={notice.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '8px 0', 
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/notices/${notice.id}`)}
                >
                  <div>
                    <Tag color="blue">{notice.category}</Tag>
                    <span style={{ marginLeft: 8 }}>{notice.title}</span>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(notice.created_at).toLocaleDateString()}
                  </Text>
                </div>
              ))}
            </Space>
          </Card>

          <Card 
            title={<span><ShoppingCartOutlined style={{ marginRight: 8 }} />热门垃圾袋</span>}
            style={{ marginBottom: 24 }}
            extra={<a onClick={() => navigate('/bags')}>更多</a>}
          >
            <Row gutter={16}>
              {bags.map(bag => (
                <Col span={6} key={bag.id}>
                  <Card 
                    hoverable 
                    style={{ textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => navigate('/bags')}
                    cover={
                      <div style={{ height: 120, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                        🛍️
                      </div>
                    }
                  >
                    <Card.Meta 
                      title={bag.name} 
                      description={
                        <div>
                          <Text type="danger" style={{ fontSize: 16, fontWeight: 'bold' }}>¥{bag.price}</Text>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col span={8}>
          <Card 
            title={<span><BookOutlined style={{ marginRight: 8 }} />文明倡导</span>}
            style={{ marginBottom: 24 }}
            extra={<a onClick={() => navigate('/advocates')}>更多</a>}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {advocates.map(adv => (
                <div 
                  key={adv.id} 
                  style={{ 
                    padding: '12px', 
                    background: '#f9f9f9', 
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate('/advocates')}
                >
                  <Text strong>{adv.title}</Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="green">{adv.category?.name || '分类'}</Tag>
                    <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                      👁 {adv.views}
                    </Text>
                  </div>
                </div>
              ))}
            </Space>
          </Card>

          <Card 
            title={<span><GiftOutlined style={{ marginRight: 8 }} />积分兑换</span>}
            extra={<a onClick={() => navigate('/products')}>更多</a>}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {products.map(product => (
                <div 
                  key={product.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate('/products')}
                >
                  <div style={{ 
                    width: 50, 
                    height: 50, 
                    background: '#f5f5f5', 
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    marginRight: 12
                  }}>🎁</div>
                  <div style={{ flex: 1 }}>
                    <Text strong>{product.name}</Text>
                    <div>
                      <Tag color="gold">{product.points_price} 积分</Tag>
                    </div>
                  </div>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default HomePage;
