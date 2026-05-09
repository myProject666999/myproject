import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Menu, Typography, Tag, Pagination, Button, Input, Modal, message, InputNumber } from 'antd';
import { ShoppingCartOutlined, SearchOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { bagAPI } from '../../services/api';

const { Title, Text } = Typography;

function BagPage() {
  const [searchParams] = useSearchParams();
  const [types, setTypes] = useState([]);
  const [bags, setBags] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeId, setTypeId] = useState('');
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBag, setSelectedBag] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTypes();
    loadBags();
  }, [page, typeId]);

  const loadTypes = async () => {
    try {
      const res = await bagAPI.getTypes();
      setTypes(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadBags = async () => {
    try {
      const res = await bagAPI.getList({ page, page_size: 8, type_id: typeId, keyword });
      setBags(res.data.data?.list || []);
      setTotal(res.data.data?.total || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadBags();
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);
      const res = await bagAPI.purchase({ bag_id: selectedBag.id, quantity });
      if (res.data.code === 200) {
        message.success('购买成功！');
        setModalOpen(false);
        loadBags();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error(error.response?.data?.message || '购买失败');
    } finally {
      setLoading(false);
    }
  };

  const openPurchase = (bag) => {
    setSelectedBag(bag);
    setQuantity(1);
    setModalOpen(true);
  };

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 0 }}>🛍️ 垃圾袋信息</Title>
      </Card>

      <Row gutter={24}>
        <Col span={6}>
          <Card title="分类导航">
            <Menu
              mode="inline"
              selectedKeys={[typeId || 'all']}
              onClick={({ key }) => { setTypeId(key === 'all' ? '' : key); setPage(1); }}
              items={[
                { key: 'all', label: '全部' },
                ...types.map(t => ({ key: String(t.id), label: t.name }))
              ]}
            />
          </Card>
        </Col>

        <Col span={18}>
          <Card>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
              <Input 
                placeholder="搜索垃圾袋..." 
                prefix={<SearchOutlined />}
                style={{ width: 250 }}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onPressEnter={handleSearch}
              />
              <Button type="primary" onClick={handleSearch}>搜索</Button>
            </div>

            <Row gutter={16}>
              {bags.map(item => (
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
                      }}>🛍️</div>
                    }
                    actions={[
                      <Button type="primary" icon={<ShoppingCartOutlined />} onClick={() => openPurchase(item)}>
                        购买
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      title={
                        <div>
                          <Tag color="blue">{item.bag_type?.name}</Tag>
                          <div style={{ marginTop: 4 }}>{item.name}</div>
                        </div>
                      }
                      description={
                        <div style={{ marginTop: 8 }}>
                          <Text type="danger" style={{ fontSize: 18, fontWeight: 'bold' }}>
                            ¥{item.price}
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
                pageSize={8} 
                onChange={setPage}
                showTotal={(t) => `共 ${t} 条`}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title="购买垃圾袋"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handlePurchase}
        confirmLoading={loading}
        okText="确认购买"
      >
        {selectedBag && (
          <div>
            <div style={{ fontSize: 18, marginBottom: 16 }}>
              <strong>{selectedBag.name}</strong>
            </div>
            <div style={{ marginBottom: 8 }}>单价: <Text type="danger" strong>¥{selectedBag.price}</Text></div>
            <div style={{ marginBottom: 8 }}>库存: {selectedBag.stock}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>购买数量:</span>
              <InputNumber 
                min={1} 
                max={selectedBag.stock}
                value={quantity}
                onChange={setQuantity}
              />
            </div>
            <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
              总价: <Text type="danger" strong style={{ fontSize: 18 }}>¥{(selectedBag.price * quantity).toFixed(2)}</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default BagPage;
