import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Image, Button, Tag, Input, List, message, Divider, Space, Typography } from 'antd';
import { ArrowLeftOutlined, EyeOutlined, StarOutlined, LikeOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import request from '../../utils/request';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadBook();
    loadComments();
  }, [id]);

  const loadBook = async () => {
    try {
      const res = await request.get(`/books/${id}`);
      setBook(res.data);
    } catch (error) {
      console.error('加载书籍详情失败', error);
    }
  };

  const loadComments = async () => {
    try {
      const res = await request.get(`/comments?type=book&target_id=${id}`);
      setComments(res.data || []);
    } catch (error) {
      console.error('加载评论失败', error);
    }
  };

  const handleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await request.post('/user/favorites', { type: 'book', target_id: parseInt(id) });
      message.success('收藏成功');
    } catch (error) {
      message.error('收藏失败或已收藏');
    }
  };

  const handleComment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (!newComment.trim()) {
      message.warning('请输入评论内容');
      return;
    }
    try {
      await request.post('/user/comments', {
        type: 'book',
        target_id: parseInt(id),
        content: newComment,
      });
      message.success('评论成功');
      setNewComment('');
      loadComments();
    } catch (error) {
      message.error('评论失败');
    }
  };

  if (!book) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        返回
      </Button>

      <Card>
        <Row gutter={24}>
          <Col span={8}>
            <Image src={book.cover} alt={book.title} style={{ width: '100%' }} />
          </Col>
          <Col span={16}>
            <Title level={2}>{book.title}</Title>
            <Space size={[0, 8]} wrap>
              <Tag color="blue">作者：{book.author}</Tag>
              {book.category && <Tag color="green">分类：{book.category.name}</Tag>}
              <Tag><EyeOutlined /> 浏览量：{book.views}</Tag>
            </Space>
            <Divider />
            <Paragraph strong>书籍简介：</Paragraph>
            <Paragraph>{book.description}</Paragraph>
            <Space>
              <Button type="primary" icon={<StarOutlined />} onClick={handleFavorite}>
                收藏
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Divider />

      <Card title="评论区">
        <div style={{ marginBottom: 16 }}>
          <TextArea
            rows={4}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="发表你的评论..."
          />
          <Button 
            type="primary" 
            onClick={handleComment}
            style={{ marginTop: 8 }}
          >
            发表评论
          </Button>
        </div>

        <List
          dataSource={comments}
          renderItem={(comment) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Tag color="blue">{comment.user?.nickname || comment.user?.username}</Tag>}
                title={new Date(comment.created_at).toLocaleString()}
                description={comment.content}
              />
            </List.Item>
          )}
          locale={{ emptyText: '暂无评论' }}
        />
      </Card>
    </div>
  );
}

export default BookDetail;
