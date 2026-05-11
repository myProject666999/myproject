import React, { useEffect, useState } from 'react';
import { Card, List, Empty, Spin, Input, Button } from 'antd';
import { CalendarOutlined, SearchOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const PublicActivities = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const loadData = async (title = '') => {
    setLoading(true);
    try {
      const res = await request.get('/public/activities', { params: { title } });
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

  const handleSearch = () => {
    loadData(searchValue);
  };

  const handleReset = () => {
    setSearchValue('');
    loadData('');
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>抗疫活动</h2>
      <div style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
        <Input.Search
          placeholder="请输入活动标题（模糊搜索）"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          enterButton={<Button type="primary" icon={<SearchOutlined />}>搜索</Button>}
          style={{ width: 400 }}
        />
        <Button onClick={handleReset}>重置</Button>
      </div>
      <Spin spinning={loading}>
        {data.length > 0 ? (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
            dataSource={data}
            renderItem={(item) => (
              <List.Item>
                <Card 
                  hoverable
                  title={<span><CalendarOutlined style={{ marginRight: 8 }} />{item.title}</span>}
                  style={{ height: '100%' }}
                >
                  <div style={{ marginBottom: 8, color: '#999', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <EnvironmentOutlined /> {item.location}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div>开始日期: {item.start_date}</div>
                    <div>结束日期: {item.end_date}</div>
                    <div>主办方: {item.organizer}</div>
                  </div>
                  <div style={{ color: '#1890ff', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <UserOutlined /> 参与人数: {item.current_participants}/{item.max_participants}
                  </div>
                  {item.description && (
                    <div style={{ marginTop: 12, borderTop: '1px solid #f0f0f0', paddingTop: 12, fontSize: 13 }}>
                      {item.description.length > 100 ? item.description.slice(0, 100) + '...' : item.description}
                    </div>
                  )}
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无活动" />
        )}
      </Spin>
    </div>
  );
};

export default PublicActivities;
