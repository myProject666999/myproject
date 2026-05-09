import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Menu, Typography, Tag, Pagination, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import { advocateAPI } from '../../services/api';

const { Title, Text } = Typography;

function AdvocatePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    loadCategories();
    loadAdvocates();
  }, [page, categoryId]);

  const loadCategories = async () => {
    try {
      const res = await advocateAPI.getCategories();
      setCategories(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadAdvocates = async () => {
    try {
      const res = await advocateAPI.getList({ page, page_size: 8, category_id: categoryId });
      setAdvocates(res.data.data?.list || []);
      setTotal(res.data.data?.total || 0);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 0 }}>📚 文明倡导</Title>
      </Card>

      <Row gutter={24}>
        <Col span={6}>
          <Card title="分类导航">
            <Menu
              mode="inline"
              selectedKeys={[categoryId || 'all']}
              onClick={({ key }) => { setCategoryId(key === 'all' ? '' : key); setPage(1); }}
              items={[
                { key: 'all', label: '全部' },
                ...categories.map(cat => ({ key: String(cat.id), label: cat.name }))
              ]}
            />
          </Card>
        </Col>

        <Col span={18}>
          <Card>
            {advocates.length === 0 ? (
              <Empty />
            ) : (
              <>
                <Row gutter={16}>
                  {advocates.map(item => (
                    <Col span={12} key={item.id} style={{ marginBottom: 16 }}>
                      <Card 
                        hoverable 
                        style={{ cursor: 'pointer', height: 200 }}
                        onClick={() => {
                          alert(`倡导详情: ${item.title}\n\n${item.content}`);
                        }}
                      >
                        <Tag color="green">{item.category?.name || '分类'}</Tag>
                        <Title level={5} style={{ marginTop: 8 }}>{item.title}</Title>
                        <Text type="secondary" style={{ 
                          display: '-webkit-box', 
                          WebkitLineClamp: 3, 
                          WebkitBoxOrient: 'vertical', 
                          overflow: 'hidden' 
                        }}>
                          {item.content}
                        </Text>
                        <div style={{ marginTop: 16 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            👁 {item.views} 浏览 · 📅 {new Date(item.created_at).toLocaleDateString()}
                          </Text>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Pagination 
                    current={page} 
                    total={total} 
                    pageSize={8} 
                    onChange={setPage}
                    showTotal={(t) => `共 ${t} 条`}
                  />
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AdvocatePage;
