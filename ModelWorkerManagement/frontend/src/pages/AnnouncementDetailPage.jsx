import { useState, useEffect } from 'react';
import { Card, Typography, message, Divider, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useParams, Link } from 'react-router-dom';
import { announcementAPI } from '../api';

const { Title, Text } = Typography;

function AnnouncementDetailPage() {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncement();
  }, [id]);

  const fetchAnnouncement = async () => {
    setLoading(true);
    try {
      const res = await announcementAPI.getById(id);
      setAnnouncement(res.data);
    } catch (error) {
      message.error('获取公告详情失败');
    } finally {
      setLoading(false);
    }
  };

  if (!announcement && !loading) {
    return <Empty description="公告不存在" />;
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Link to="/announcements">← 返回公告列表</Link>
      <Card style={{ marginTop: 16 }}>
        {announcement && (
          <>
            <Title level={1} style={{ marginBottom: 16 }}>{announcement.title}</Title>
            <div style={{ color: '#666', marginBottom: 16 }}>
              <UserOutlined style={{ marginRight: 4 }} /> 发布者：{announcement.author}
              <span style={{ marginLeft: 16 }}>
                发布时间：{new Date(announcement.created_at).toLocaleString()}
              </span>
            </div>
            <Divider />
            <div style={{ lineHeight: 1.8, fontSize: 16 }}>
              {announcement.content}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default AnnouncementDetailPage;
