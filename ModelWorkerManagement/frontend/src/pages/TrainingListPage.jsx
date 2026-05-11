import { useState, useEffect } from 'react';
import { Card, List, Button, Tag, message, Space } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { trainingAPI } from '../api';

function TrainingListPage() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const res = await trainingAPI.getAll();
      setTrainings(res.data);
    } catch (error) {
      message.error('获取培训列表失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>培训信息</h1>
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }}
        dataSource={trainings}
        loading={loading}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              cover={
                <img
                  alt={item.title}
                  src={item.image_url}
                  style={{ height: 200, objectFit: 'cover' }}
                />
              }
              actions={[
                <Button type="link" onClick={() => navigate('/trainings/' + item.id)}>
                  查看详情
                </Button>,
              ]}
            >
              <Card.Meta
                title={item.title}
                description={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <CalendarOutlined style={{ marginRight: 4 }} />
                      {item.start_date} 至 {item.end_date}
                    </div>
                    <div>
                      <EnvironmentOutlined style={{ marginRight: 4 }} />
                      {item.location}
                    </div>
                    <div>
                      <UserOutlined style={{ marginRight: 4 }} />
                      {item.current_enroll}/{item.max_enroll} 人
                    </div>
                    <Tag color={item.current_enroll < item.max_enroll ? 'green' : 'red'}>
                      {item.current_enroll < item.max_enroll ? '可报名' : '已满'}
                    </Tag>
                  </Space>
                }
              />
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}

export default TrainingListPage;
