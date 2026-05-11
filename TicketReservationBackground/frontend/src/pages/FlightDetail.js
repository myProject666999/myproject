import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout, Menu, Card, Descriptions, Button, message, Space, Typography, Tag } from 'antd';
import { ArrowLeftOutlined, AppstoreOutlined, HomeOutlined, MessageOutlined, ShoppingCartOutlined, LogoutOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const FlightDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFlight();
  }, [id]);

  const loadFlight = async () => {
    try {
      const response = await api.get(`/flights/${id}`);
      setFlight(response.data);
    } catch (error) {
      message.error('加载航班信息失败');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const formatTime = (dateStr) => {
    return dayjs(dateStr).format('HH:mm');
  };

  const formatDate = (dateStr) => {
    return dayjs(dateStr).format('YYYY年MM月DD日');
  };

  const menuItems = [
    { key: 'home', icon: <HomeOutlined />, label: '首页', onClick: () => navigate('/') },
    { key: 'comments', icon: <MessageOutlined />, label: '留言评论', onClick: () => navigate('/comments') },
  ];

  if (token && user) {
    if (user.role === 'admin') {
      menuItems.push({ key: 'admin', label: '管理后台', onClick: () => navigate('/admin') });
    } else {
      menuItems.push({ key: 'user', icon: <ShoppingCartOutlined />, label: '用户中心', onClick: () => navigate('/user') });
    }
  }

  if (!flight) {
    return <div>加载中...</div>;
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
          items={menuItems}
          style={{ flex: 1, minWidth: 0, borderBottom: 'none' }}
        />
        <Space>
          {token && user ? (
            <>
              <span style={{ color: '#666' }}>{user.name || user.username}</span>
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
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
          style={{ marginBottom: 24 }}
        >
          返回列表
        </Button>

        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Space align="center">
                <Title level={3} style={{ margin: 0 }}>
                  {flight.airline} {flight.flight_number}
                </Title>
                <Tag color="green">{flight.status === 'available' ? '可预订' : '不可预订'}</Tag>
              </Space>
            </div>

            <Card size="small" style={{ background: '#f5f5f5' }}>
              <Space size={48} align="center" style={{ width: '100%', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 'bold' }}>{formatTime(flight.departure_time)}</div>
                  <div style={{ fontSize: 18, color: '#666' }}>{flight.departure_city}</div>
                  <div style={{ color: '#999' }}>{formatDate(flight.departure_time)}</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', maxWidth: 300 }}>
                  <div style={{ color: '#1890ff', fontSize: 24 }}>✈</div>
                  <div style={{ color: '#999' }}>直达</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 'bold' }}>{formatTime(flight.arrival_time)}</div>
                  <div style={{ fontSize: 18, color: '#666' }}>{flight.arrival_city}</div>
                  <div style={{ color: '#999' }}>{formatDate(flight.arrival_time)}</div>
                </div>
              </Space>
            </Card>

            <Descriptions title="航班详情" bordered column={2}>
              <Descriptions.Item label="航空公司">{flight.airline}</Descriptions.Item>
              <Descriptions.Item label="航班号">{flight.flight_number}</Descriptions.Item>
              <Descriptions.Item label="出发城市">{flight.departure_city}</Descriptions.Item>
              <Descriptions.Item label="到达城市">{flight.arrival_city}</Descriptions.Item>
              <Descriptions.Item label="出发时间">{dayjs(flight.departure_time).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="到达时间">{dayjs(flight.arrival_time).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="机型">{flight.aircraft || '未指定'}</Descriptions.Item>
              <Descriptions.Item label="航班状态">
                <Tag color={flight.status === 'available' ? 'green' : 'red'}>
                  {flight.status === 'available' ? '可预订' : '不可预订'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="票价信息" bordered column={3}>
              <Descriptions.Item label="经济舱">
                <div style={{ color: '#ff4d4f', fontSize: 24, fontWeight: 'bold' }}>¥{flight.economy_price}</div>
                <div style={{ color: '#999' }}>剩余 {flight.economy_seats} 张</div>
              </Descriptions.Item>
              <Descriptions.Item label="商务舱">
                {flight.business_price > 0 ? (
                  <>
                    <div style={{ color: '#ff4d4f', fontSize: 24, fontWeight: 'bold' }}>¥{flight.business_price}</div>
                    <div style={{ color: '#999' }}>剩余 {flight.business_seats} 张</div>
                  </>
                ) : (
                  <div style={{ color: '#999' }}>暂无</div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="头等舱">
                {flight.first_class_price > 0 ? (
                  <>
                    <div style={{ color: '#ff4d4f', fontSize: 24, fontWeight: 'bold' }}>¥{flight.first_class_price}</div>
                    <div style={{ color: '#999' }}>剩余 {flight.first_class_seats} 张</div>
                  </>
                ) : (
                  <div style={{ color: '#999' }}>暂无</div>
                )}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Button
                type="primary"
                size="large"
                loading={loading}
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
            </div>
          </Space>
        </Card>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#001529', color: '#fff' }}>
        <div>机票预订系统 ©{new Date().getFullYear()}</div>
      </Footer>
    </Layout>
  );
};

export default FlightDetail;
