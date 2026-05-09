import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Input, Select, Pagination, Empty, Space, Tag, Button } from 'antd';
import { SearchOutlined, EyeOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import request from '../../utils/request';

const { Meta } = Card;

function Knowledge() {
  const navigate = useNavigate();
  const [points, setPoints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    loadCategories();
    loadPoints();
  }, [page, categoryId]);

  const loadCategories = async () => {
    try {
      const res = await request.get('/categories');
      setCategories(res.data || []);
    } catch (error) {
      console.error('加载分类失败', error);
    }
  };

  const loadPoints = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (categoryId) params.append('category_id', categoryId);
      if (keyword) params.append('keyword', keyword);

      const res = await request.get(`/knowledge-points?${params.toString()}`);
      setPoints(res.data?.list || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      console.error('加载知识点失败', error);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadPoints();
  };

  const handleFavorite = async (e, id) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await request.post('/user/favorites', { type: 'knowledge', target_id: id });
    } catch (error) {
      console.error('收藏失败', error);
    }
  };

  return (
    <div>
      <h1>知识点列表</h1>
      
      <Space style={{ marginBottom: 24 }}>
        <Input
          placeholder="搜索知识点"
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 300 }}
        />
        <Select
          placeholder="选择分类"
          value={categoryId || undefined}
          onChange={(v) => { setCategoryId(v); setPage(1); }}
          style={{ width: 200 }}
          allowClear
        >
          {categories.map((cat) => (
            <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
          ))}
        </Select>
        <Button type="primary" onClick={handleSearch}>搜索</Button>
      </Space>

      {points.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {points.map((point) => (
              <Col span={8} key={point.id}>
                <Card
                  hoverable
                  onClick={() => navigate(`/knowledge/${point.id}`)}
                >
                  <Meta 
                    title={point.title} 
                    description={
                      <div>
                        <div style={{ marginBottom: 8 }}>
                          {point.category && <Tag color="green">{point.category.name}</Tag>}
                        </div>
                        <div style={{ color: '#666', marginBottom: 8, height: 60, overflow: 'hidden' }}>
                          {point.content}
                        </div>
                        <Space>
                          <span><EyeOutlined /> {point.views}</span>
                          <Button 
                            type="text" 
                            icon={<StarOutlined />}
                            onClick={(e) => handleFavorite(e, point.id)}
                          >
                            收藏
                          </Button>
                        </Space>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
          
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={setPage}
              showTotal={(total) => `共 ${total} 条`}
            />
          </div>
        </>
      ) : (
        <Empty description="暂无知识点" />
      )}
    </div>
  );
}

export default Knowledge;
