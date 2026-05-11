import { useState, useEffect } from 'react';
import { List, Card, Empty, message, Tag, Button, Space, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HeartOutlined, EyeOutlined, BookOutlined } from '@ant-design/icons';
import { favoriteAPI } from '../api';

function MyFavoritesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState({ trainings: [], posts: [] });

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoriteAPI.getMyFavorites();
      setFavorites(res.data || { trainings: [], posts: [] });
    } catch (error) {
      message.error('获取收藏失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfavorite = async (type, id) => {
    try {
      await favoriteAPI.toggleFavorite({ type, target_id: id });
      message.success('已取消收藏');
      fetchFavorites();
    } catch (error) {
      message.error('取消收藏失败');
    }
  };

  const renderTrainingList = () => {
    const trainings = favorites.trainings || [];
    if (trainings.length === 0) {
      return <Empty description="暂无收藏的培训" />;
    }
    return (
      <List
        dataSource={trainings}
        loading={loading}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => navigate('/trainings/' + item.id)}
              >
                查看详情
              </Button>,
              <Button
                type="link"
                danger
                icon={<HeartOutlined />}
                onClick={() => handleUnfavorite('training', item.id)}
              >
                取消收藏
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <span
                  style={{ cursor: 'pointer', fontWeight: 500 }}
                  onClick={() => navigate('/trainings/' + item.id)}
                >
                  {item.title}
                </span>
              }
              description={
                <Space size="middle">
                  <span><BookOutlined /> {item.category || '默认分类'}</span>
                  <Tag color="green">{item.status === 'published' ? '已发布' : '草稿'}</Tag>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  const renderPostList = () => {
    const posts = favorites.posts || [];
    if (posts.length === 0) {
      return <Empty description="暂无收藏的帖子" />;
    }
    return (
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
              <Button
                type="link"
                danger
                icon={<HeartOutlined />}
                onClick={() => handleUnfavorite('post', item.id)}
              >
                取消收藏
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <span
                  style={{ cursor: 'pointer', fontWeight: 500 }}
                  onClick={() => navigate('/forum/' + item.id)}
                >
                  {item.title}
                </span>
              }
              description={
                <Space size="middle">
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                  <Tag color="blue">{item.category || '默认分类'}</Tag>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  const items = [
    {
      key: '1',
      label: '收藏的培训',
      children: renderTrainingList(),
    },
    {
      key: '2',
      label: '收藏的帖子',
      children: renderPostList(),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>我的收藏</h2>
      <Card>
        <Tabs defaultActiveKey="1" items={items} />
      </Card>
    </div>
  );
}

export default MyFavoritesPage;
