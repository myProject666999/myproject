import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Carousel, Card, Row, Col, Form, Select, DatePicker, Button, message, Typography, Space } from 'antd';
import { AppstoreOutlined, UserOutlined, LogoutOutlined, ShoppingCartOutlined, MessageOutlined, HomeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';
import { logout } from '../store/slices/authSlice';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '重庆', '西安', '南京', '武汉', '厦门', '青岛'];

const Home = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/flights', { params });
      setFlights(response.data);
    } catch (error) {
      message.error('加载航班信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (values) => {
    const params = {};
    if (values.departureCity) params.departure_city = values.departureCity;
    if (values.arrivalCity) params.arrival_city = values.arrivalCity;
    if (values.date) params.date = values.date.format('YYYY-MM-DD');
    loadFlights(params);
  };

  const handleLogout = () => {
    dispatch(logout());
    message.success('已退出登录');
    navigate('/login');
  };

  const formatTime = (dateStr) => {
    return dayjs(dateStr).format('HH:mm');
  };

  const formatDate = (dateStr) => {
    return dayjs(dateStr).format('MM-DD');
  };

  const menuItems = [
    { key: 'home', icon: <HomeOutlined />, label: '首页', onClick: () => navigate('/') },
    { key: 'comments', icon: <MessageOutlined />, label: '留言评论', onClick: () => navigate('/comments') },
  ];

  if (token && user) {
    if (user.role === 'admin') {
      menuItems.push({ key: 'admin', icon: <UserOutlined />, label: '管理后台', onClick: () => navigate('/admin') });
    } else {
      menuItems.push({ key: 'user', icon: <ShoppingCartOutlined />, label: '用户中心', onClick: () => navigate('/user') });
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ position: 'sticky', top: 0, zIndex: 1, width: '100%', display: 'flex', alignItems: 'center', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 48 }}>
          <AppstoreOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 8 }} />
          <span style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>机票预订系统</span>
        </div>
        <Menu
          theme="light"
          mode="horizontal"
          defaultSelectedKeys={['home']}
          items={menuItems}
          style={{ flex: 1, minWidth: 0, borderBottom: 'none' }}
        />
        <Space>
          {token && user ? (
            <>
              <span style={{ color: '#666' }}>欢迎，{user.name || user.username}</span>
              <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>退出</Button>
            </>
          ) : (
            <>
              <Button type="link" onClick={() => navigate('/login')}>登录</Button>
              <Button type="primary" onClick={() => navigate('/register')}>注册</Button>
            </>
          )}
        </Space>
      </Header>

      <Content style={{ padding: '24px 48px' }}>
        <Carousel autoplay className="home-carousel" effect="fade">
          <div>
            <div className="carousel-slide" style={{ background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)', borderRadius: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <Title level={2} style={{ color: '#fff' }}>全球航班，一键预订</Title>
                <p style={{ color: '#fff', fontSize: 18 }}>覆盖国内外热门航线，让出行更便捷</p>
              </div>
            </div>
          </div>
          <div>
            <div className="carousel-slide" style={{ background: 'linear-gradient(135deg, #52c41a 0%, #1890ff 100%)', borderRadius: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <Title level={2} style={{ color: '#fff' }}>优惠票价，限时抢购</Title>
                <p style={{ color: '#fff', fontSize: 18 }}>会员专享折扣，省钱又省心</p>
              </div>
            </div>
          </div>
          <div>
            <div className="carousel-slide" style={{ background: 'linear-gradient(135deg, #fa8c16 0%, #f5222d 100%)', borderRadius: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <Title level={2} style={{ color: '#fff' }}>贴心服务，安心出行</Title>
                <p style={{ color: '#fff', fontSize: 18 }}>24小时客服支持，退改签无忧</p>
              </div>
            </div>
          </div>
        </Carousel>

        <Card className="search-card" style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 24 }}>搜索航班</Title>
          <Form form={form} layout="inline" onFinish={handleSearch}>
            <Form.Item name="departureCity" label="出发城市">
              <Select
                placeholder="选择出发城市"
                style={{ width: 150 }}
                allowClear
                options={cities.map(city => ({ value: city, label: city }))}
              />
            </Form.Item>
            <Form.Item name="arrivalCity" label="到达城市">
              <Select
                placeholder="选择到达城市"
                style={{ width: 150 }}
                allowClear
                options={cities.map(city => ({ value: city, label: city }))}
              />
            </Form.Item>
            <Form.Item name="date" label="出发日期">
              <DatePicker style={{ width: 150 }} placeholder="选择日期" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                搜索
              </Button>
            </Form.Item>
            <Form.Item>
              <Button onClick={() => { form.resetFields(); loadFlights(); }}>
                重置
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Title level={4} style={{ marginBottom: 24 }}>航班列表</Title>
        {flights.length === 0 ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
              <AppstoreOutlined style={{ fontSize: 48, marginBottom: 16 }} />
              <p>暂无航班信息</p>
            </div>
          </Card>
        ) : (
          flights.map(flight => (
            <Card key={flight.id} className="flight-card">
              <Row align="middle">
                <Col xs={24} sm={8}>
                  <Space direction="vertical" size={0}>
                    <div className="time-display">{formatTime(flight.departure_time)}</div>
                    <div className="city-display">{flight.departure_city}</div>
                    <div style={{ color: '#999', fontSize: 12 }}>{formatDate(flight.departure_time)}</div>
                  </Space>
                </Col>
                <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                  <Space direction="vertical" size={4}>
                    <div style={{ color: '#999' }}>{flight.airline} {flight.flight_number}</div>
                    <div style={{ color: '#999' }}>✈ 直达</div>
                  </Space>
                </Col>
                <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
                  <Space direction="vertical" size={0} align="end">
                    <div className="time-display">{formatTime(flight.arrival_time)}</div>
                    <div className="city-display">{flight.arrival_city}</div>
                    <div style={{ color: '#999', fontSize: 12 }}>{formatDate(flight.arrival_time)}</div>
                  </Space>
                </Col>
                <Divider style={{ margin: '16px 0' }} />
                <Col xs={24}>
                  <Row align="middle" justify="space-between">
                    <Col>
                      <Space size={24}>
                        <div>
                          <div style={{ color: '#999', fontSize: 12 }}>经济舱</div>
                          <div className="price-tag">¥{flight.economy_price}</div>
                          <div style={{ color: '#999', fontSize: 12 }}>剩余 {flight.economy_seats} 张</div>
                        </div>
                        {flight.business_price > 0 && (
                          <div>
                            <div style={{ color: '#999', fontSize: 12 }}>商务舱</div>
                            <div className="price-tag">¥{flight.business_price}</div>
                            <div style={{ color: '#999', fontSize: 12 }}>剩余 {flight.business_seats} 张</div>
                          </div>
                        )}
                        {flight.first_class_price > 0 && (
                          <div>
                            <div style={{ color: '#999', fontSize: 12 }}>头等舱</div>
                            <div className="price-tag">¥{flight.first_class_price}</div>
                            <div style={{ color: '#999', fontSize: 12 }}>剩余 {flight.first_class_seats} 张</div>
                          </div>
                        )}
                      </Space>
                    </Col>
                    <Col>
                      <Space>
                        <Button onClick={() => navigate(`/flights/${flight.id}`)}>
                          查看详情
                        </Button>
                        <Button
                          type="primary"
                          onClick={() => {
                            if (!token) {
                              message.warning('请先登录');
                              navigate('/login');
                              return;
                            }
                            navigate(`/booking/${flight.id}`);
                          }}
                        >
                          立即预订
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          ))
        )}
      </Content>

      <Footer style={{ textAlign: 'center', background: '#001529', color: '#fff' }}>
        <div>机票预订系统 ©{new Date().getFullYear()} Created with React & Golang</div>
      </Footer>
    </Layout>
  );
};

const Divider = ({ style }) => <div style={{ width: '100%', height: 1, background: '#f0f0f0', ...style }} />;

export default Home;
