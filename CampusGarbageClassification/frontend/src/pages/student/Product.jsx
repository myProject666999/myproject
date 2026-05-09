import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Tag, Pagination, Button, Input, Modal, message, InputNumber } from 'antd';
import { GiftOutlined, SearchOutlined } from '@ant-design/icons';
import { productAPI } from '../../services/api';

const { Title, Text } = Typography;

function ProductPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userPoints = user.student?.points || 0;

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = async () => {
    try {
      const res = await productAPI.getList({ page, page_size: 12, keyword });
      setProducts(res.data.data?.list || []);
      setTotal(res.data.data?.total || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const handleExchange = async () => {
    try {
      setLoading(true);
      const res = await productAPI.exchange({ product_id: selectedProduct.id, quantity });
      if (res.data.code === 200) {
        message.success('兑换成功！');
        setModalOpen(false);
        loadProducts();
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.student) {
          user.student.points -= selectedProduct.points_price * quantity;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error(error.response?.data?.message || '兑换失败');
    } finally {
      setLoading(false);
    }
  };

  const openExchange = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setModalOpen(true);
  };

  const totalPointsNeeded = selectedProduct ? selectedProduct.points_price * quantity : 0;

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ marginBottom: 0 }}>🎁 商品兑换</Title>
          <Tag color="gold" style={{ fontSize: 16, padding: '4px 12px' }}>
            我的积分: {userPoints}
          </Tag>
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
          <Input 
            placeholder="搜索商品..." 
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => { setPage(1); loadProducts(); }}
          />
          <Button type="primary" onClick={() => { setPage(1); loadProducts(); }}>搜索</Button>
        </div>

        <Row gutter={16}>
          {products.map(item => (
            <Col span={6} key={item.id} style={{ marginBottom: 16 }}>
              <Card
                hoverable
                cover={
                  <div style={{ 
                    height: 150, 
                    background: '#f5f5f5', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: 60
                  }}>🎁</div>
                }
                actions={[
                  <Button 
                    type="primary" 
                    icon={<GiftOutlined />}
                    disabled={item.points_price > userPoints || item.stock === 0}
                    onClick={() => openExchange(item)}
                  >
                    {item.stock === 0 ? '已售罄' : '兑换'}
                  </Button>
                ]}
              >
                <Card.Meta
                  title={
                    <div>
                      <Tag color="purple">{item.category}</Tag>
                      <div style={{ marginTop: 4 }}>{item.name}</div>
                    </div>
                  }
                  description={
                    <div style={{ marginTop: 8 }}>
                      <Text type="warning" style={{ fontSize: 18, fontWeight: 'bold' }}>
                        {item.points_price} 积分
                      </Text>
                      <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                        库存: {item.stock}
                      </Text>
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
            total={total} 
            pageSize={12} 
            onChange={setPage}
            showTotal={(t) => `共 ${t} 件商品`}
          />
        </div>
      </Card>

      <Modal
        title="兑换商品"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleExchange}
        confirmLoading={loading}
        okText="确认兑换"
        okButtonProps={{ disabled: totalPointsNeeded > userPoints }}
      >
        {selectedProduct && (
          <div>
            <div style={{ fontSize: 18, marginBottom: 16 }}>
              <strong>{selectedProduct.name}</strong>
            </div>
            <div style={{ marginBottom: 8 }}>所需积分: <Text type="warning" strong>{selectedProduct.points_price} 积分/件</Text></div>
            <div style={{ marginBottom: 8 }}>库存: {selectedProduct.stock}</div>
            <div style={{ marginBottom: 8 }}>我的积分: <Text type={userPoints < totalPointsNeeded ? 'danger' : 'success'} strong>{userPoints} 积分</Text></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>兑换数量:</span>
              <InputNumber 
                min={1} 
                max={selectedProduct.stock}
                value={quantity}
                onChange={setQuantity}
              />
            </div>
            <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
              共需: <Text type="warning" strong style={{ fontSize: 18 }}>{totalPointsNeeded} 积分</Text>
              {totalPointsNeeded > userPoints && (
                <Text type="danger" style={{ marginLeft: 8 }}>(积分不足)</Text>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ProductPage;
