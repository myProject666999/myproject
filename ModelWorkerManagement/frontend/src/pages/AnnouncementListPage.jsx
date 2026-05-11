import { useState, useEffect } from 'react';
import { Card, List, Typography, message, Space, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { announcementAPI } from '../api';

const { Title, Text } = Typography;

function AnnouncementListPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await announcementAPI.getAll();
      setAnnouncements(res.data);
    } catch (error) {
      message.error('获取公告列表失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: 24 }}>系统公告</Title>
      <Card>
        <List
          dataSource={announcements}
          loading={loading}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Space key="date">
                  <Text type="secondary">
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </Space>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Title level={4} style={{ cursor: 'pointer' }} onClick={() => navigate('/announcements/' + item.id)}>
                    {item.title}
                  </Title>
                }
                description={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text ellipsis style={{ display: 'block' }}>
                      {item.content}
                    </Text>
                    <Space>
                      <Tag color="blue">发布者: {item.author}</Tag>
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: '暂无公告' }}
        />
      </Card>
    </div>
  );
}

export default AnnouncementListPage;
