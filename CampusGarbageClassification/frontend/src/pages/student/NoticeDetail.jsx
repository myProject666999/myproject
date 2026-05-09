import React, { useEffect, useState } from 'react';
import { Card, Typography, Tag, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { noticeAPI } from '../../services/api';

const { Title, Text, Paragraph } = Typography;

function NoticeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    loadNotice();
  }, [id]);

  const loadNotice = async () => {
    try {
      const res = await noticeAPI.getDetail(id);
      setNotice(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!notice) return <div>加载中...</div>;

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          返回列表
        </Button>
      </Card>

      <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Tag color="blue">{notice.category}</Tag>
          <Title level={3} style={{ marginTop: 16 }}>{notice.title}</Title>
          <Text type="secondary">
            发布时间: {new Date(notice.created_at).toLocaleString()}
          </Text>
        </div>
        <hr style={{ margin: '24px 0' }} />
        <Paragraph style={{ fontSize: 16, lineHeight: 2 }}>
          {notice.content}
        </Paragraph>
      </Card>
    </div>
  );
}

export default NoticeDetail;
