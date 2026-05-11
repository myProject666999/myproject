import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Layout, Row, Col, Menu, Card, Form, Input, Select, Button, message, Space, Typography, Rate, Avatar, Empty } from 'antd';
import { HomeOutlined, MessageOutlined, AppstoreOutlined, UserOutlined, LogoutOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';
import { logout } from '../store/slices/authSlice';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Comments = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/comments');
      setComments(response.data);
    } catch (error) {
      message.error('加载留言失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await api.post('/comments', values);
      message.success('留言发表成功');
      form.resetFields();
      loadComments();
    } catch (error) {
      message.error('发表留言失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
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
          defaultSelectedKeys={['comments']}
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
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card title="全部留言" style={{ marginBottom: 24 }}>
              {comments.length === 0 ? (
                <Empty description="暂无留言" />
              ) : (
                comments.map(comment => (
                  <Card
                    key={comment.id}
                    size="small"
                    className="comment-card"
                    style={{ marginBottom: 16 }}
                  >
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Space>
                        <Avatar icon={<UserOutlined />} />
                        <div>
                          <div>
                            <Text strong>{comment.user.name || comment.user.username}</Text>
                            {comment.flight && (
                              <Text type="secondary" style={{ marginLeft: 8 }}>
                                评价航班：{comment.flight.flight_number}
                              </Text>
                            )}
                          </div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {dayjs(comment.created_at).format('YYYY-MM-DD HH:mm')}
                          </Text>
                        </div>
                      </Space>
                      {comment.rating > 0 && (
                        <Rate disabled defaultValue={comment.rating} />
                      )}
                      <div>{comment.content}</div>
                    </Space>
                  </Card>
                ))
              )}
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="发表留言">
              {token ? (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                >
                  <Form.Item
                    name="content"
                    label="留言内容"
                    rules={[{ required: true, message: '请输入留言内容' }]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="请输入您的留言或评价"
                      maxLength={500}
                      showCount
                    />
                  </Form.Item>

                  <Form.Item name="rating" label="评分">
                    <Rate defaultValue={5} />
                  </Form.Item>

                  <Form.Item name="type" label="留言类型">
                    <Select defaultValue="general">
                      <Option value="general">综合评价</Option>
                      <Option value="service">服务评价</Option>
                      <Option value="suggestion">意见建议</Option>
                      <Option value="other">其他</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                      发表留言
                    </Button>
                  </Form.Item>
                </Form>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Empty description="请先登录后发表留言" />
                  <Button type="primary" onClick={() => navigate('/login')} style={{ marginTop: 16 }}>
                    去登录
                  </Button>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#001529', color: '#fff' }}>
        机票预订系统 ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default Comments;
