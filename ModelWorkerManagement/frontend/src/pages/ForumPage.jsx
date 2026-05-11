import { useState, useEffect } from 'react';
import { Card, List, Button, Typography, message, Space, Modal, Form, Input, Tag } from 'antd';
import { PlusOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { forumAPI } from '../api';
import useAuthStore from '../store/useAuthStore';

const { Title, Text } = Typography;
const { TextArea } = Input;

function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await forumAPI.getAll();
      setPosts(res.data);
    } catch (error) {
      message.error('获取帖子列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await forumAPI.create(values);
      message.success('发布成功');
      setModalVisible(false);
      form.resetFields();
      fetchPosts();
    } catch (error) {
      message.error('发布失败');
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>论坛交流</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreatePost}>
          发布新帖
        </Button>
      </div>

      <Card>
        <List
          dataSource={posts}
          loading={loading}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Space key="info">
                  <Text type="secondary">
                    <UserOutlined style={{ marginRight: 4 }} />
                    {item.username}
                  </Text>
                  <Text type="secondary">
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </Space>,
              ]}
            >
              <List.Item.Meta
                avatar={<MessageOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                title={
                  <Title
                    level={4}
                    style={{ cursor: 'pointer', margin: 0 }}
                    onClick={() => navigate('/forum/' + item.id)}
                  >
                    {item.title}
                  </Title>
                }
                description={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text ellipsis style={{ display: 'block' }}>
                      {item.content}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: '暂无帖子，快来发布第一个帖子吧！' }}
        />
      </Card>

      <Modal
        title="发布新帖"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="发布"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入帖子标题" />
          </Form.Item>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextArea rows={6} placeholder="请输入帖子内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ForumPage;
