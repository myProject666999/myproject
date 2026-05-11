import { useState, useEffect } from 'react';
import { Card, Button, Tag, message, Space, Typography, List, Avatar, Input, Empty, Modal, Form } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, UserOutlined, HeartOutlined, HeartFilled, MessageOutlined, SendOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { trainingAPI, favoriteAPI, commentAPI } from '../api';
import useAuthStore from '../store/useAuthStore';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

function TrainingDetailPage() {
  const { id } = useParams();
  const [training, setTraining] = useState(null);
  const [comments, setComments] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchTraining();
    fetchComments();
    if (isAuthenticated) {
      checkFavorite();
    }
  }, [id, isAuthenticated]);

  const fetchTraining = async () => {
    setLoading(true);
    try {
      const res = await trainingAPI.getById(id);
      setTraining(res.data);
    } catch (error) {
      message.error('获取培训详情失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await commentAPI.getAll({ target_id: id, target_type: 'training' });
      setComments(res.data);
    } catch (error) {
      message.error('获取评论失败');
    }
  };

  const checkFavorite = async () => {
    try {
      const res = await favoriteAPI.getAll({ type: 'training' });
      const favorite = res.data.find((f) => f.target_id === parseInt(id));
      if (favorite) {
        setIsFavorited(true);
        setFavoriteId(favorite.id);
      }
    } catch (error) {
      console.error('检查收藏状态失败');
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    setActionLoading(true);
    try {
      if (isFavorited) {
        await favoriteAPI.delete(favoriteId);
        setIsFavorited(false);
        setFavoriteId(null);
        message.success('已取消收藏');
      } else {
        const res = await favoriteAPI.create({
          target_id: parseInt(id),
          target_type: 'training',
        });
        setIsFavorited(true);
        setFavoriteId(res.data.favorite.id);
        message.success('收藏成功');
      }
    } catch (error) {
      message.error('操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    if (training.current_enroll >= training.max_enroll) {
      message.warning('培训已满员');
      return;
    }

    setActionLoading(true);
    try {
      await trainingAPI.enroll(id);
      setIsEnrolled(true);
      message.success('报名成功，等待审核');
    } catch (error) {
      if (error.response?.data?.error === 'Already enrolled') {
        message.warning('您已经报名了');
      } else {
        message.error('报名失败');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    if (!newComment.trim()) {
      message.warning('请输入评论内容');
      return;
    }

    setActionLoading(true);
    try {
      await commentAPI.create({
        target_id: parseInt(id),
        target_type: 'training',
        content: newComment,
      });
      message.success('评论成功');
      setNewComment('');
      fetchComments();
    } catch (error) {
      message.error('评论失败');
    } finally {
      setActionLoading(false);
    }
  };

  if (!training && !loading) {
    return <Empty description="培训不存在" />;
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Link to="/trainings">← 返回培训列表</Link>

      {training && (
        <Card style={{ marginTop: 16 }} loading={loading}>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <img
                src={training.image_url}
                alt={training.title}
                style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 8 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Title level={1} style={{ marginBottom: 16 }}>{training.title}</Title>
              <Paragraph type="secondary" style={{ fontSize: 16 }}>
                {training.description}
              </Paragraph>

              <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 16 }}>
                <div>
                  <Text strong>培训时间：</Text>
                  <Text>{training.start_date} 至 {training.end_date}</Text>
                </div>
                <div>
                  <Text strong>培训地点：</Text>
                  <Text>{training.location}</Text>
                </div>
                <div>
                  <Text strong>报名人数：</Text>
                  <Text>{training.current_enroll}/{training.max_enroll} 人</Text>
                  <Tag color={training.current_enroll < training.max_enroll ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                    {training.current_enroll < training.max_enroll ? '可报名' : '已满'}
                  </Tag>
                </div>
                <div>
                  <Text strong>发布者：</Text>
                  <Text>{training.author}</Text>
                </div>
              </Space>

              <Space style={{ marginTop: 24 }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={handleEnroll}
                  loading={actionLoading}
                  disabled={isEnrolled || training.current_enroll >= training.max_enroll}
                >
                  {isEnrolled ? '已报名' : training.current_enroll >= training.max_enroll ? '已满员' : '立即报名'}
                </Button>
                <Button
                  size="large"
                  icon={isFavorited ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                  onClick={handleFavorite}
                  loading={actionLoading}
                >
                  {isFavorited ? '已收藏' : '收藏'}
                </Button>
              </Space>
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <Title level={3}>培训内容</Title>
            <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
              {training.content}
            </Paragraph>
          </div>
        </Card>
      )}

      <Card title={`评论 (${comments.length})`} style={{ marginTop: 16 }}>
        {isAuthenticated && (
          <div style={{ marginBottom: 24 }}>
            <TextArea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="发表您的评论..."
            />
            <div style={{ marginTop: 8, textAlign: 'right' }}>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleAddComment}
                loading={actionLoading}
              >
                发表评论
              </Button>
            </div>
          </div>
        )}

        <List
          dataSource={comments}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={
                  <span>
                    {item.username}
                    <span style={{ color: '#999', marginLeft: 8, fontSize: 12 }}>
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </span>
                }
                description={item.content}
              />
            </List.Item>
          )}
          locale={{ emptyText: '暂无评论' }}
        />
      </Card>
    </div>
  );
}

export default TrainingDetailPage;
