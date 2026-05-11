import React, { useEffect, useState } from 'react';
import { Card, List, Empty, Spin } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const PublicAnnouncements = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await request.get('/public/announcements');
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>公告通知</h2>
      <Spin spinning={loading}>
        {data.length > 0 ? (
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={data}
            renderItem={(item) => (
              <List.Item>
                <Card 
                  hoverable
                  title={<span><BellOutlined style={{ marginRight: 8 }} />{item.title}</span>}
                >
                  <div style={{ marginBottom: 12, color: '#999' }}>
                    作者: {item.author} | 发布时间: {new Date(item.created_at).toLocaleString()}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                    {item.content}
                  </div>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无公告" />
        )}
      </Spin>
    </div>
  );
};

export default PublicAnnouncements;
