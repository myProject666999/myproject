import React, { useState, useEffect } from 'react';
import { Input, Button, Card, message, Form } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { messageApi, likeApi, userApi } from '../services/api';

const SendPage = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [likedMessages, setLikedMessages] = useState(new Set());

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchMessages();
  }, [navigate]);

  const fetchMessages = async () => {
    try {
      const response = await messageApi.getAll({ status: 1, limit: 20 });
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSend = async () => {
    if (!content.trim()) {
      message.warning('请输入消息内容');
      return;
    }

    if (content.length > 200) {
      message.warning('消息内容不能超过200个字符');
      return;
    }

    setLoading(true);
    try {
      const response = await messageApi.create({
        user_id: user.id,
        content: content.trim(),
      });

      if (response.data.is_sensitive) {
        message.warning('消息包含敏感词，已被过滤');
      } else {
        message.success('消息发送成功，等待审核');
      }
      setContent('');
      fetchMessages();
    } catch (error) {
      if (error.response?.status === 429) {
        message.error('发送过于频繁，请稍后再试');
      } else {
        message.error('发送失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (messageId) => {
    try {
      if (likedMessages.has(messageId)) {
        await likeApi.unlike(messageId, { user_id: user.id });
        setLikedMessages(new Set([...likedMessages].filter(id => id !== messageId)));
      } else {
        await likeApi.like(messageId, { user_id: user.id });
        setLikedMessages(new Set([...likedMessages, messageId]));
      }
      fetchMessages();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <div className="send-container">
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🎤 弹幕互动</span>
            <Button size="small" onClick={handleLogout}>退出</Button>
          </div>
        }
        style={{ borderRadius: 16 }}
      >
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <span style={{ fontSize: 16 }}>
            欢迎, <strong>{user?.nickname}</strong>
          </span>
        </div>

        <Form>
          <Form.Item>
            <Input.TextArea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入弹幕内容..."
              rows={3}
              maxLength={200}
              showCount
              onPressEnter={handleSend}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={loading}
              block
              size="large"
            >
              发送弹幕
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 30 }}>
          <h3 style={{ marginBottom: 16 }}>💬 最近的弹幕</h3>
          {messages.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999' }}>暂无消息</p>
          ) : (
            <div>
              {messages.map((msg) => (
                <Card
                  key={msg.id}
                  size="small"
                  style={{ marginBottom: 10, borderRadius: 8 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{msg.user?.nickname || '匿名'}</strong>
                      <p style={{ margin: '4px 0 0 0' }}>{msg.content}</p>
                    </div>
                    <div
                      className="like-btn"
                      onClick={() => handleLike(msg.id)}
                    >
                      {likedMessages.has(msg.id) ? '❤️' : '🤍'} {msg.likes}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SendPage;
