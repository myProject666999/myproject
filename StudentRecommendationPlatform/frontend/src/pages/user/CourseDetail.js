import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Image, Button, Tag, Input, List, message, Divider, Space, Typography } from 'antd';
import { ArrowLeftOutlined, EyeOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import request from '../../utils/request';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);

  useEffect(() => {
    loadCourse();
    loadComments();
    checkFavorite();
  }, [id]);

  const loadCourse = async () => {
    try {
      const res = await request.get(`/courses/${id}`);
      setCourse(res.data);
    } catch (error) {
      console.error('加载课程详情失败', error);
    }
  };

  const loadComments = async () => {
    try {
      const res = await request.get(`/comments?type=course&target_id=${id}`);
      setComments(res.data || []);
    } catch (error) {
      console.error('加载评论失败', error);
    }
  };

  const checkFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const res = await request.get('/user/favorites?type=course');
      const favorites = res.data || [];
      const courseId = parseInt(id);
      const found = favorites.find(f => f.target_id === courseId);
      setIsFavorite(!!found);
      setFavoriteId(found ? found.id : null);
    } catch (error) {
      console.error('检查收藏状态失败', error);
    }
  };

  const handleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      if (isFavorite && favoriteId) {
        await request.delete(`/user/favorites/${favoriteId}`);
        setIsFavorite(false);
        setFavoriteId(null);
        message.success('取消收藏成功');
      } else {
        const res = await request.post('/user/favorites', { type: 'course', target_id: parseInt(id) });
        setIsFavorite(true);
        setFavoriteId(res.data.id);
        message.success('收藏成功');
      }
    } catch (error) {
      message.error('操作失败');
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
        type: 'course',
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

  if (!course) {
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
            <Image src={course.cover} alt={course.title} style={{ width: '100%' }} />
          </Col>
          <Col span={16}>
            <Title level={2}>{course.title}</Title>
            <Space size={[0, 8]} wrap>
              <Tag color="blue">讲师：{course.teacher}</Tag>
              {course.category && <Tag color="green">分类：{course.category.name}</Tag>}
              <Tag><EyeOutlined /> 浏览量：{course.views}</Tag>
            </Space>
            <Divider />
            <Paragraph strong>课程简介：</Paragraph>
            <Paragraph>{course.description}</Paragraph>
            <Space>
              <Button 
                type={isFavorite ? 'primary' : 'default'} 
                icon={isFavorite ? <StarFilled /> : <StarOutlined />} 
                onClick={handleFavorite}
              >
                {isFavorite ? '已收藏' : '收藏'}
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

export default CourseDetail;
