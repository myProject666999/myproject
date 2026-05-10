import { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Button, Pagination, Empty, message } from 'antd';
import { ShoppingCartOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { publicApi, userApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const { Content } = Layout;
const { Meta } = Card;

export default function ProductList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const keyword = searchParams.get('keyword');
  const categoryId = searchParams.get('category_id');

  useEffect(() => {
    loadProducts();
  }, [page, keyword, categoryId]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 12 };
      if (keyword) params.keyword = keyword;
      if (categoryId) params.category_id = categoryId;

      const res = await publicApi.getProducts(params);
      setProducts(res.data?.list || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      message.error('加载商品失败');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    try {
      await userApi.addToCart({ product_id: productId, quantity: 1 });
      message.success('已添加到购物车');
    } catch (error) {
      message.error(error.message || '添加失败');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px 50px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ marginBottom: 24 }}>
            {keyword ? `搜索: ${keyword}` : categoryId ? '商品列表' : '全部商品'}
          </h2>

          {products.length === 0 && !loading ? (
            <Empty description="暂无商品" />
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {products.map((product) => (
                  <Col span={6} key={product.id}>
                    <Card
                      hoverable
                      loading={loading}
                      cover={
                        <img
                          alt={product.name}
                          src={product.image || 'https://picsum.photos/300/300'}
                          style={{ height: 200, objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => navigate(`/products/${product.id}`)}
                        />
                      }
                      actions={[
                        <Button type="link" onClick={() => navigate(`/products/${product.id}`)}>
                          查看详情
                        </Button>,
                        <Button type="primary" icon={<ShoppingCartOutlined />} onClick={() => addToCart(product.id)}>
                          加入购物车
                        </Button>,
                      ]}
                    >
                      <Meta
                        title={product.name}
                        description={
                          <div style={{ color: '#ff4d4f', fontSize: 18, fontWeight: 'bold' }}>
                            ¥{product.price}
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>

              {total > 0 && (
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Pagination
                    current={page}
                    total={total}
                    pageSize={12}
                    onChange={setPage}
                    showTotal={(total) => `共 ${total} 件商品`}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </Content>
    </Layout>
  );
}
