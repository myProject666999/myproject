import React, { useState, useEffect } from 'react';
import { Card, List, Button, Input, message, Typography, Tag, Empty, Form } from 'antd';
import request from '../../utils/request';

const { Title } = Typography;
const { TextArea } = Input;

function Messages() {
  const [messages, setMessages] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await request.get('/user/messages');
      setMessages(res.data || []);
    } catch (error) {
      console.error('加载留言失败', error);
    }
  };

  const handleSubmit = async (values) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('请先登录');
      return;
    }
    try {
      await request.post('/user/messages', values);
      message.success('留言成功，请等待管理员回复');
      form.resetFields();
      loadMessages();
    } catch (error) {
      message.error('留言失败');
    }
  };

  return (
    <div>
      <Title level={2}>在线留言</Title>

      <Card title="发表留言" style={{ marginBottom: 24 }}>
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item
            name="content"
            rules={[{ required: true, message: '请输入留言内容' }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入您的留言内容..."
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交留言
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="我的留言">
        {messages.length > 0 ? (
          <List
            itemLayout="vertical"
            dataSource={messages}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>留言时间：{new Date(item.created_at).toLocaleString()}</span>
                      <Tag color={item.status === 1 ? 'green' : 'orange'}>
                        {item.status === 1 ? '已回复' : '待回复'}
                      </Tag>
                    </div>
                  }
                />
                <div style={{ marginBottom: 12, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                  <strong>您的留言：</strong>{item.content}
                </div>
                {item.reply && (
                  <div style={{ padding: 12, background: '#e6f7ff', borderRadius: 4, border: '1px solid #91d5ff' }}>
                    <strong>管理员回复：</strong>{item.reply}
                  </div>
                )}
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无留言" />
        )}
      </Card>
    </div>
  );
}

export default Messages;
