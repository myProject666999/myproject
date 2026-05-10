import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Button, message, Spin, Typography, Empty, Tag } from 'antd';
import { DeleteOutlined, HeartOutlined } from '@ant-design/icons';
import { userAPI } from '../utils/api';

const { Title } = Typography;

const typeLabels = {
  notice: '紧急通知',
  material: '物资信息',
  recruitment: '招募信息',
  knowledge: '心理知识',
  rumor: '辟谣信息'
};

const typeColors = {
  notice: 'red',
  material: 'blue',
  recruitment: 'purple',
  knowledge: 'pink',
  rumor: 'green'
};

const Favorites = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getFavorites();
      setFavorites(res || []);
    } catch (error) {
      message.error('获取收藏列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await userAPI.removeFavorite(id);
      message.success('已取消收藏');
      fetchFavorites();
    } catch (error) {
      message.error('取消收藏失败');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
          <HeartOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
          我的收藏
        </Title>
      </div>

      <Card>
        <Spin spinning={loading}>
          {favorites.length === 0 ? (
            <Empty description="暂无收藏" />
          ) : (
            <List
              dataSource={favorites}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button 
                      danger 
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemove(item.id)}
                    >
                      取消收藏
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Tag color={typeColors[item.type] || 'default'} style={{ marginRight: 8 }}>
                          {typeLabels[item.type] || item.type}
                        </Tag>
                        <span>收藏 #{item.target_id}</span>
                      </div>
                    }
                    description={`收藏于 ${new Date(item.created_at).toLocaleString()}`}
                  />
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default Favorites;
