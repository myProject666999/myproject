import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Descriptions, Tag, Button, Space, Avatar, List, Input, Rate, message, Divider, Modal } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, UserOutlined, TrophyOutlined, LikeOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { activityApi } from '../../utils/api';
import dayjs from 'dayjs';

const { TextArea } = Input;

const ActivityDetail = () => {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await activityApi.getDetail(id);
      setActivity(res.data.activity);
      setComments(res.data.comments || []);
    } catch (error) {
      console.error('Failed to fetch activity detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'orange', text: '待开始' },
      active: { color: 'green', text: '报名中' },
      ongoing: { color: 'blue', text: '进行中' },
      completed: { color: 'purple', text: '已完成' },
      cancelled: { color: 'red', text: '已取消' },
    };
    const info = statusMap[status] || { color: 'default', text: '未知' };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const handleRegister = async () => {
    Modal.confirm({
      title: '确认报名',
      content: '您确定要报名参加这个活动吗？',
      onOk: async () => {
        try {
          setSubmitting(true);
          await activityApi.register(id);
          message.success('报名成功！');
          fetchData();
        } catch (error) {
          console.error('Failed to register:', error);
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const handleCancelRegistration = async () => {
    Modal.confirm({
      title: '取消报名',
      content: '您确定要取消这个活动的报名吗？',
      onOk: async () => {
        try {
          setSubmitting(true);
          await activityApi.cancel(id);
          message.success('取消报名成功！');
          fetchData();
        } catch (error) {
          console.error('Failed to cancel registration:', error);
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      message.warning('请输入评论内容');
      return;
    }

    try {
      setSubmitting(true);
      await activityApi.createComment(id, {
        content: commentText,
        rating,
      });
      message.success('评论成功！');
      setCommentText('');
      setRating(5);
      fetchData();
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!activity) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <Row gutter={24}>
        <Col span={18}>
          <Card loading={loading}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ marginBottom: 16 }}>{activity.title}</h1>
              <Space size="middle">
                {getStatusTag(activity.status)}
                <Tag icon={<TrophyOutlined />} color="gold">
                  {activity.points} 积分
                </Tag>
                <span style={{ color: '#666' }}>
                  <UserOutlined /> {activity.current_participants}/{activity.max_participants} 人
                </span>
              </Space>
            </div>

            {activity.cover_image && (
              <div style={{ marginBottom: 24 }}>
                <img
                  src={activity.cover_image}
                  alt={activity.title}
                  style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }}
                />
              </div>
            )}

            <Descriptions column={2} bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="开始时间">
                <CalendarOutlined /> {dayjs(activity.start_date).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="结束时间">
                <CalendarOutlined /> {dayjs(activity.end_date).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="活动地点">
                <EnvironmentOutlined /> {activity.location}
              </Descriptions.Item>
              <Descriptions.Item label="活动分类">
                {activity.category}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <h3>活动描述</h3>
              <p style={{ lineHeight: 1.8 }}>{activity.description}</p>
            </div>

            <Divider />

            <div>
              <h3>活动评论 ({comments.length})</h3>
              <div style={{ marginBottom: 24 }}>
                <Rate value={rating} onChange={setRating} />
                <TextArea
                  rows={3}
                  placeholder="分享您的活动体验..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  style={{ marginTop: 12, marginBottom: 12 }}
                />
                <Button
                  type="primary"
                  icon={<LikeOutlined />}
                  loading={submitting}
                  onClick={handleCommentSubmit}
                >
                  发表评论
                </Button>
              </div>

              <List
                dataSource={comments}
                renderItem={(comment) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={
                        <Space>
                          <span>{comment.user?.real_name || comment.user?.username}</span>
                          <Rate disabled defaultValue={comment.rating} style={{ fontSize: 14 }} />
                        </Space>
                      }
                      description={
                        <span style={{ color: '#666' }}>
                          {dayjs(comment.created_at).format('YYYY-MM-DD HH:mm')}
                        </span>
                      }
                    />
                    <div>{comment.content}</div>
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button
                type="primary"
                size="large"
                block
                loading={submitting}
                disabled={activity.status !== 'active' || activity.current_participants >= activity.max_participants}
                onClick={handleRegister}
              >
                立即报名
              </Button>
              <Button
                size="large"
                block
                danger
                loading={submitting}
                onClick={handleCancelRegistration}
              >
                取消报名
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ActivityDetail;
