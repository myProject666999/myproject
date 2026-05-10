import { useState, useEffect } from 'react';
import { Layout, Menu, Carousel, Card, Row, Col, Input, Button, message } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { publicApi, userApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const { Header, Content, Footer } = Layout;
const { Meta } = Card;

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [recommendProducts, setRecommendProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadData();
    if (user) {
      loadCartCount();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [bannersRes, categoriesRes, hotRes, newRes, recommendRes] = await Promise.all([
        publicApi.getBanners(),
        publicApi.getCategories(),
        publicApi.getHotProducts(),
        publicApi.getNewProducts(),
        publicApi.getRecommendProducts(),
      ]);
      setBanners(bannersRes.data || []);
      setCategories(categoriesRes.data || []);
      setHotProducts(hotRes.data || []);
      setNewProducts(newRes.data || []);
      setRecommendProducts(recommendRes.data || []);
    } catch (error) {
      console.error('加载数据失败', error);
    }
  };

  const loadCartCount = async () => {
    try {
      const res = await userApi.getCart();
      setCartCount(res.data?.length || 0);
    } catch (error) {
      console.error('加载购物车失败', error);
    }
  };

  const handleSearch = (value) => {
    navigate(`/products?keyword=${value}`);
  };

  const handleLogout = async () => {
    await logout();
    message.success('退出成功');
    navigate('/login');
  };

  const addToCart = async (productId) => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    try {
      await userApi.addToCart({ product_id: productId, quantity: 1 });
      setCartCount(cartCount + 1);
      message.success('已添加到购物车');
    } catch (error) {
      message.error(error.message || '添加失败');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 50px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
            <Link to="/" style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
              服装商城
            </Link>
            <Menu mode="horizontal" style={{ border: 'none' }}>
              <Menu.Item key="home">
                <Link to="/">首页</Link>
              </Menu.Item>
              <Menu.Item key="products">
                <Link to="/products">全部商品</Link>
              </Menu.Item>
              {categories.slice(0, 5).map((cat) => (
                <Menu.Item key={cat.id}>
                  <Link to={`/products?category_id=${cat.id}`}>{cat.name}</Link>
                </Menu.Item>
              ))}
            </Menu>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Input.Search
              placeholder="搜索商品"
              onSearch={handleSearch}
              style={{ width: 200 }}
              enterButton={<Button icon={<SearchOutlined />} type="primary" />}
            />
            <Link to="/cart">
              <Button icon={<ShoppingCartOutlined />} shape="circle">
                {cartCount > 0 && <span style={{ marginLeft: 5 }}>{cartCount}</span>}
              </Button>
            </Link>
            {user ? (
              <Menu mode="horizontal" style={{ border: 'none' }}>
                <Menu.SubMenu key="user" icon={<UserOutlined />} title={user.nickname || user.username}>
                  <Menu.Item key="profile">
                    <Link to="/profile">个人中心</Link>
                  </Menu.Item>
                  <Menu.Item key="orders">
                    <Link to="/orders">我的订单</Link>
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item key="logout" onClick={handleLogout} icon={<LogoutOutlined />}>
                    退出登录
                  </Menu.Item>
                </Menu.SubMenu>
              </Menu>
            ) : (
              <Link to="/login">
                <Button type="primary">登录</Button>
              </Link>
            )}
          </div>
        </div>
      </Header>

      <Content style={{ background: '#f0f2f5' }}>
        {banners.length > 0 && (
          <div style={{ maxWidth: 1200, margin: '20px auto' }}>
            <Carousel autoplay style={{ borderRadius: 8, overflow: 'hidden' }}>
              {banners.map((banner) => (
                <div key={banner.id}>
                  <img
                    src={banner.image || 'https://picsum.photos/1200/300'}
                    alt={banner.title}
                    style={{ width: '100%', height: 300, objectFit: 'cover' }}
                  />
                </div>
              ))}
            </Carousel>
          </div>
        )}

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 0' }}>
          {hotProducts.length > 0 && (
            <div style={{ marginBottom: 30 }}>
              <h2 style={{ marginBottom: 16 }}>热销商品</h2>
              <Row gutter={[16, 16]}>
                {hotProducts.map((product) => (
                  <Col span={6} key={product.id}>
                    <Card
                      hoverable
                      cover={
                        <img
                          alt={product.name}
                          src={product.image || 'https://picsum.photos/300/300'}
                          style={{ height: 200, objectFit: 'cover' }}
                        />
                      }
                      actions={[
                        <Button type="link" onClick={() => navigate(`/products/${product.id}`)}>查看详情</Button>,
                        <Button type="primary" onClick={() => addToCart(product.id)}>加入购物车</Button>,
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
            </div>
          )}

          {newProducts.length > 0 && (
            <div style={{ marginBottom: 30 }}>
              <h2 style={{ marginBottom: 16 }}>新品上线</h2>
              <Row gutter={[16, 16]}>
                {newProducts.map((product) => (
                  <Col span={6} key={product.id}>
                    <Card
                      hoverable
                      cover={
                        <img
                          alt={product.name}
                          src={product.image || 'https://picsum.photos/300/300'}
                          style={{ height: 200, objectFit: 'cover' }}
                        />
                      }
                      actions={[
                        <Button type="link" onClick={() => navigate(`/products/${product.id}`)}>查看详情</Button>,
                        <Button type="primary" onClick={() => addToCart(product.id)}>加入购物车</Button>,
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
            </div>
          )}

          {recommendProducts.length > 0 && (
            <div style={{ marginBottom: 30 }}>
              <h2 style={{ marginBottom: 16 }}>为你推荐</h2>
              <Row gutter={[16, 16]}>
                {recommendProducts.map((product) => (
                  <Col span={6} key={product.id}>
                    <Card
                      hoverable
                      cover={
                        <img
                          alt={product.name}
                          src={product.image || 'https://picsum.photos/300/300'}
                          style={{ height: 200, objectFit: 'cover' }}
                        />
                      }
                      actions={[
                        <Button type="link" onClick={() => navigate(`/products/${product.id}`)}>查看详情</Button>,
                        <Button type="primary" onClick={() => addToCart(product.id)}>加入购物车</Button>,
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
            </div>
          )}
        </div>
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        服装销售管理系统 ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}
