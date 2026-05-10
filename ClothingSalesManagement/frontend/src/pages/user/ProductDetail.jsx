import { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Image, Button, Descriptions, InputNumber, message } from 'antd';
import { ShoppingCartOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { publicApi, userApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const { Content } = Layout;

export default function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const res = await publicApi.getProductDetail(id);
      setProduct(res.data);
    } catch (error) {
      message.error('加载商品失败');
    }
  };

  const addToCart = async () => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await userApi.addToCart({ product_id: product.id, quantity });
      message.success('已添加到购物车');
    } catch (error) {
      message.error(error.message || '添加失败');
    } finally {
      setLoading(false);
    }
  };

  const buyNow = async () => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await userApi.addToCart({ product_id: product.id, quantity });
      navigate('/cart');
    } catch (error) {
      message.error(error.message || '添加失败');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return <div style={{ padding: 50, textAlign: 'center' }}>加载中...</div>;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px 50px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Card>
            <Row gutter={32}>
              <Col span={10}>
                <Image
                  width="100%"
                  src={product.image || 'https://picsum.photos/400/400'}
                  style={{ borderRadius: 8 }}
                />
              </Col>
              <Col span={14}>
                <h1 style={{ marginBottom: 16 }}>{product.name}</h1>
                <div style={{ color: '#ff4d4f', fontSize: 32, fontWeight: 'bold', marginBottom: 16 }}>
                  ¥{product.price}
                  {product.originalPrice > product.price && (
                    <span style={{ color: '#999', fontSize: 16, marginLeft: 16, textDecoration: 'line-through' }}>
                      ¥{product.originalPrice}
                    </span>
                  )}
                </div>
                <Descriptions column={1} style={{ marginBottom: 24 }}>
                  <Descriptions.Item label="库存">{product.stock} 件</Descriptions.Item>
                  <Descriptions.Item label="销量">{product.sales} 件</Descriptions.Item>
                  <Descriptions.Item label="商品描述">{product.description || '暂无描述'}</Descriptions.Item>
                </Descriptions>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <span>数量：</span>
                  <InputNumber
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={setQuantity}
                    size="large"
                  />
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={addToCart}
                    loading={loading}
                  >
                    加入购物车
                  </Button>
                  <Button
                    size="large"
                    icon={<CreditCardOutlined />}
                    onClick={buyNow}
                    loading={loading}
                  >
                    立即购买
                  </Button>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
