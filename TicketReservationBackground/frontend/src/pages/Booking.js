import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Menu, Card, Form, Input, Select, Button, message, Space, Typography, Steps, Alert, Row, Col, Descriptions } from 'antd';
import { ArrowLeftOutlined, AppstoreOutlined, HomeOutlined, MessageOutlined, ShoppingCartOutlined, LogoutOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';
import { logout } from '../store/slices/authSlice';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;
const { Option } = Select;

const Booking = () => {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  useEffect(() => {
    loadFlight();
  }, [flightId]);

  const loadFlight = async () => {
    try {
      const response = await api.get(`/flights/${flightId}`);
      setFlight(response.data);
    } catch (error) {
      message.error('加载航班信息失败');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getPrice = (seatClass) => {
    if (!flight) return 0;
    switch (seatClass) {
      case 'economy':
        return flight.economy_price;
      case 'business':
        return flight.business_price;
      case 'first_class':
        return flight.first_class_price;
      default:
        return 0;
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await api.post('/orders', {
        flight_id: parseInt(flightId),
        ...values,
      });
      message.success('订单提交成功！');
      setCurrentStep(2);
    } catch (error) {
      message.error(error.response?.data?.error || '订单提交失败');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    try {
      await form.validateFields();
      setCurrentStep(1);
    } catch (error) {
      message.error('请填写完整信息');
    }
  };

  const menuItems = [
    { key: 'home', icon: <HomeOutlined />, label: '首页', onClick: () => navigate('/') },
    { key: 'comments', icon: <MessageOutlined />, label: '留言评论', onClick: () => navigate('/comments') },
    { key: 'user', icon: <ShoppingCartOutlined />, label: '用户中心', onClick: () => navigate('/user') },
  ];

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
          {token && user && (
            <>
              <span style={{ color: '#666' }}>{user.name || user.username}</span>
              <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>退出</Button>
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
          返回首页
        </Button>

        <Card>
          <Steps
            current={currentStep}
            items={[
              { title: '填写信息', description: '乘机人和联系人' },
              { title: '确认订单', description: '核对订单信息' },
              { title: '完成', description: '订单提交成功' },
            ]}
            style={{ marginBottom: 32 }}
          />

          {currentStep === 0 && (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleNext}
            >
              <Card title="航班信息" style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <div>
                      <span style={{ color: '#999' }}>航班号：</span>
                      <strong>{flight.flight_number}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#999' }}>航空公司：</span>
                      <strong>{flight.airline}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#999' }}>航线：</span>
                      <strong>{flight.departure_city} → {flight.arrival_city}</strong>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <span style={{ color: '#999' }}>起飞时间：</span>
                      <strong>{dayjs(flight.departure_time).format('YYYY-MM-DD HH:mm')}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#999' }}>到达时间：</span>
                      <strong>{dayjs(flight.arrival_time).format('YYYY-MM-DD HH:mm')}</strong>
                    </div>
                  </Col>
                </Row>
              </Card>

              <Form.Item
                name="seatClass"
                label="舱位等级"
                rules={[{ required: true, message: '请选择舱位' }]}
              >
                <Select placeholder="请选择舱位">
                  <Option value="economy">经济舱 ¥{flight.economy_price}（剩余 {flight.economy_seats} 张）</Option>
                  {flight.business_price > 0 && flight.business_seats > 0 && (
                    <Option value="business">商务舱 ¥{flight.business_price}（剩余 {flight.business_seats} 张）</Option>
                  )}
                  {flight.first_class_price > 0 && flight.first_class_seats > 0 && (
                    <Option value="first_class">头等舱 ¥{flight.first_class_price}（剩余 {flight.first_class_seats} 张）</Option>
                  )}
                </Select>
              </Form.Item>

              <Card title="乘机人信息" style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="passengerName"
                      label="姓名"
                      rules={[{ required: true, message: '请输入乘机人姓名' }]}
                    >
                      <Input placeholder="请输入乘机人真实姓名" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="passengerPhone"
                      label="手机号码"
                      rules={[{ required: true, message: '请输入手机号码' }]}
                    >
                      <Input placeholder="请输入手机号码" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name="passengerID"
                  label="身份证号"
                  rules={[{ required: true, message: '请输入身份证号' }]}
                >
                  <Input placeholder="请输入身份证号" />
                </Form.Item>
              </Card>

              <Card title="联系人信息" style={{ marginBottom: 24 }}>
                <Alert
                  message="提示：联系人信息用于接收行程通知，请准确填写"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="contactName"
                      label="联系人姓名"
                      rules={[{ required: true, message: '请输入联系人姓名' }]}
                    >
                      <Input placeholder="请输入联系人姓名" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="contactPhone"
                      label="联系人电话"
                      rules={[{ required: true, message: '请输入联系人电话' }]}
                    >
                      <Input placeholder="请输入联系人电话" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} size="large" block>
                  下一步
                </Button>
              </Form.Item>
            </Form>
          )}

          {currentStep === 1 && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card title="订单信息">
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="航班号">{flight.flight_number}</Descriptions.Item>
                  <Descriptions.Item label="航空公司">{flight.airline}</Descriptions.Item>
                  <Descriptions.Item label="航线">{flight.departure_city} → {flight.arrival_city}</Descriptions.Item>
                  <Descriptions.Item label="出发时间">{dayjs(flight.departure_time).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
                  <Descriptions.Item label="舱位">
                    {form.getFieldValue('seatClass') === 'economy' ? '经济舱' :
                     form.getFieldValue('seatClass') === 'business' ? '商务舱' : '头等舱'}
                  </Descriptions.Item>
                  <Descriptions.Item label="价格">
                    <span style={{ color: '#ff4d4f', fontSize: 20, fontWeight: 'bold' }}>
                      ¥{getPrice(form.getFieldValue('seatClass'))}
                    </span>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="乘机人信息">
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="姓名">{form.getFieldValue('passengerName')}</Descriptions.Item>
                  <Descriptions.Item label="手机号">{form.getFieldValue('passengerPhone')}</Descriptions.Item>
                  <Descriptions.Item label="身份证号" span={2}>{form.getFieldValue('passengerID')}</Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="联系人信息">
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="联系人">{form.getFieldValue('contactName')}</Descriptions.Item>
                  <Descriptions.Item label="联系电话">{form.getFieldValue('contactPhone')}</Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="退改签说明">
                <Alert
                  message="退改签政策"
                  description={
                    <ul>
                      <li>起飞前24小时退票：收取票价10%退票费</li>
                      <li>起飞前2小时至24小时退票：收取票价20%退票费</li>
                      <li>起飞前2小时内退票：收取票价50%退票费</li>
                      <li>改签需提前24小时办理，改签费用按差额收取</li>
                    </ul>
                  }
                  type="info"
                  showIcon
                />
              </Card>

              <Space style={{ width: '100%', justifyContent: 'center' }}>
                <Button size="large" onClick={() => setCurrentStep(0)}>
                  返回修改
                </Button>
                <Button
                  type="primary"
                  size="large"
                  loading={loading}
                  onClick={onFinish}
                >
                  确认提交订单
                </Button>
              </Space>
            </Space>
          )}

          {currentStep === 2 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }}>✓</div>
              <Title level={3}>订单提交成功！</Title>
              <p style={{ color: '#666', marginBottom: 24 }}>
                感谢您的预订，我们已向您的手机发送行程确认短信。
              </p>
              <Space>
                <Button onClick={() => navigate('/user')}>查看我的订单</Button>
                <Button type="primary" onClick={() => navigate('/')}>
                  继续预订
                </Button>
              </Space>
            </div>
          )}
        </Card>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#001529', color: '#fff' }}>
        <div>机票预订系统 ©{new Date().getFullYear()}</div>
      </Footer>
    </Layout>
  );
};

export default Booking;
