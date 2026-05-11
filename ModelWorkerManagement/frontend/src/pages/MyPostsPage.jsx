import { useState, useEffect } from 'react';
import { List, Card, Empty, message, Tag, Button, Space, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { MessageOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { forumAPI } from '../api';

function MyPostsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await forumAPI.getMyPosts();
      setPosts(res.data || []);
    } catch (error) {
      message.error('获取我的发布失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await forumAPI.deletePost(id);
      message.success('删除成功');
      fetchPosts();
    } catch (error) {
      message.error('删除失败');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>我的发布</h2>
        <Button type="primary" onClick={() => navigate('/forum')}>
          发布新帖
        </Button>
      </div>
      
      <Card>
        {posts.length === 0 ? (
          <Empty description="暂无发布的帖子" />
        ) : (
          <List
            dataSource={posts}
            loading={loading}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button 
                    type="link" 
                    icon={<EyeOutlined />}
                    onClick={() => navigate('/forum/' + item.id)}
                  >
                    查看详情
                  </Button>,
                  <Popconfirm
                    title="确定要删除这个帖子吗？"
                    onConfirm={() => handleDelete(item.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  title={<span style={{ cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/forum/' + item.id)}>{item.title}</span>}
                  description={
                    <Space size="middle">
                      <span>{new Date(item.created_at).toLocaleString()}</span>
                      <Tag color="blue">{item.category || '默认分类'}</Tag>
                      <span><MessageOutlined /> {item.comment_count || 0}</span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}

export default MyPostsPage;
