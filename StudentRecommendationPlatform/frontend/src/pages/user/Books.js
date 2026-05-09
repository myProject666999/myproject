import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Input, Select, Pagination, Empty, Space, Tag, Button } from 'antd';
import { SearchOutlined, EyeOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import request from '../../utils/request';

const { Meta } = Card;

function Books() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    loadCategories();
    loadBooks();
  }, [page, categoryId]);

  const loadCategories = async () => {
    try {
      const res = await request.get('/categories');
      setCategories(res.data || []);
    } catch (error) {
      console.error('加载分类失败', error);
    }
  };

  const loadBooks = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (categoryId) params.append('category_id', categoryId);
      if (keyword) params.append('keyword', keyword);

      const res = await request.get(`/books?${params.toString()}`);
      setBooks(res.data?.list || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      console.error('加载书籍失败', error);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadBooks();
  };

  const handleFavorite = async (e, bookId) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await request.post('/user/favorites', { type: 'book', target_id: bookId });
    } catch (error) {
      console.error('收藏失败', error);
    }
  };

  return (
    <div>
      <h1>书籍列表</h1>
      
      <Space style={{ marginBottom: 24 }}>
        <Input
          placeholder="搜索书籍名称或作者"
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

      {books.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {books.map((book) => (
              <Col span={6} key={book.id}>
                <Card
                  hoverable
                  cover={<img alt={book.title} src={book.cover} style={{ height: 200, objectFit: 'cover' }} />}
                  onClick={() => navigate(`/books/${book.id}`)}
                >
                  <Meta 
                    title={book.title} 
                    description={
                      <div>
                        <div style={{ marginBottom: 8 }}>
                          <Tag color="blue">{book.author}</Tag>
                          {book.category && <Tag>{book.category.name}</Tag>}
                        </div>
                        <Space>
                          <span><EyeOutlined /> {book.views}</span>
                          <Button 
                            type="text" 
                            icon={<StarOutlined />}
                            onClick={(e) => handleFavorite(e, book.id)}
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
        <Empty description="暂无书籍" />
      )}
    </div>
  );
}

export default Books;
