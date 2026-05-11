import { useState, useEffect } from 'react';
import { Card, List, Input, Button, message, Avatar, Divider, Empty } from 'antd';
import { MessageOutlined, UserOutlined, SendOutlined } from '@ant-design/icons';
import { useParams, Link } from 'react-router-dom';
import { forumAPI, commentAPI } from '../api';
import useAuthStore from '../store/useAuthStore';

const { TextArea } = Input;

function ForumDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await forumAPI.getById(id);
      setPost(res.data);
    } catch (error) {
      message.error('获取帖子详情失败');
    }
  };

  const fetchComments = async () => {
    try {
      const res = await commentAPI.getAll({ target_id: id, target_type: 'forum' });
      setComments(res.data);
    } catch (error) {
      message.error('获取评论失败');
    }
  };

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      return;
    }
    if (!newComment.trim()) {
      message.warning('请输入评论内容');
      return;
    }

    setLoading(true);
    try {
      await commentAPI.create({
        target_id: parseInt(id),
        target_type: 'forum',
        content: newComment,
      });
      message.success('评论成功');
      setNewComment('');
      fetchComments();
    } catch (error) {
      message.error('评论失败');
    } finally {
      setLoading(false);
    }
  };

  if (!post) {
    return <Empty description="帖子不存在" />;
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Link to="/forum">← 返回列表</Link>
      <Card style={{ marginTop: 16 }}>
        <h1 style={{ marginBottom: 16 }}>{post.title}</h1>
        <div style={{ color: '#666', marginBottom: 16 }}>
          <UserOutlined style={{ marginRight: 4 }} /> {post.username}
          <span style={{ marginLeft: 16 }}>
            发布于 {new Date(post.created_at).toLocaleString()}
          </span>
        </div>
        <Divider />
        <div style={{ lineHeight: 1.8, fontSize: 16 }}>
          {post.content}
        </div>
      </Card>

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
                loading={loading}
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

export default ForumDetailPage;
