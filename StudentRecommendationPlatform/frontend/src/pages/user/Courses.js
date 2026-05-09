import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Input, Select, Pagination, Empty, Space, Tag, Button } from 'antd';
import { SearchOutlined, EyeOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import request from '../../utils/request';

const { Meta } = Card;

function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    loadCategories();
    loadCourses();
  }, [page, categoryId]);

  const loadCategories = async () => {
    try {
      const res = await request.get('/categories');
      setCategories(res.data || []);
    } catch (error) {
      console.error('加载分类失败', error);
    }
  };

  const loadCourses = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (categoryId) params.append('category_id', categoryId);
      if (keyword) params.append('keyword', keyword);

      const res = await request.get(`/courses?${params.toString()}`);
      setCourses(res.data?.list || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      console.error('加载课程失败', error);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadCourses();
  };

  const handleFavorite = async (e, id) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await request.post('/user/favorites', { type: 'course', target_id: id });
    } catch (error) {
      console.error('收藏失败', error);
    }
  };

  return (
    <div>
      <h1>课程列表</h1>
      
      <Space style={{ marginBottom: 24 }}>
        <Input
          placeholder="搜索课程名称或讲师"
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

      {courses.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {courses.map((course) => (
              <Col span={6} key={course.id}>
                <Card
                  hoverable
                  cover={<img alt={course.title} src={course.cover} style={{ height: 180, objectFit: 'cover' }} />}
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <Meta 
                    title={course.title} 
                    description={
                      <div>
                        <div style={{ marginBottom: 8 }}>
                          <Tag color="blue">{course.teacher}</Tag>
                          {course.category && <Tag>{course.category.name}</Tag>}
                        </div>
                        <Space>
                          <span><EyeOutlined /> {course.views}</span>
                          <Button 
                            type="text" 
                            icon={<StarOutlined />}
                            onClick={(e) => handleFavorite(e, course.id)}
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
        <Empty description="暂无课程" />
      )}
    </div>
  );
}

export default Courses;
