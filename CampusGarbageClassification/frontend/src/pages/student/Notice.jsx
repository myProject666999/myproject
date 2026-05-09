import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Typography, Input, Select, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { noticeAPI } from '../../services/api';

const { Title, Text } = Typography;

function NoticePage() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState(['公告', '活动通知', '系统公告']);

  useEffect(() => {
    loadNotices();
  }, [page, keyword, category]);

  const loadNotices = async () => {
    try {
      const res = await noticeAPI.getList({ page, page_size: 10, keyword, category });
      setNotices(res.data.data?.list || []);
      setTotal(res.data.data?.total || 0);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 0 }}>📢 公告信息</Title>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
          <Input 
            placeholder="搜索公告..." 
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          />
          <Select 
            placeholder="选择分类" 
            style={{ width: 150 }}
            allowClear
            value={category || undefined}
            onChange={(v) => { setCategory(v || ''); setPage(1); }}
            options={categories.map(c => ({ label: c, value: c }))}
          />
        </div>

        <List
          itemLayout="vertical"
          size="large"
          dataSource={notices}
          renderItem={item => (
            <List.Item
              key={item.id}
              style={{ cursor: 'pointer', padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}
              onClick={() => navigate(`/notices/${item.id}`)}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      <Tag color="blue">{item.category}</Tag>
                      <span style={{ marginLeft: 8, fontSize: 16 }}>{item.title}</span>
                    </span>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </div>
                }
                description={
                  <Text type="secondary" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.content}
                  </Text>
                }
              />
            </List.Item>
          )}
        />

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination 
            current={page} 
            total={total} 
            pageSize={10} 
            onChange={setPage}
            showTotal={(t) => `共 ${t} 条`}
          />
        </div>
      </Card>
    </div>
  );
}

export default NoticePage;
