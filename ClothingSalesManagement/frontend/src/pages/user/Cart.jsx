import { useState, useEffect } from 'react';
import { Layout, Table, Button, InputNumber, message, Card, Empty, Space, Popconfirm } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../api';

const { Content } = Layout;

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await userApi.getCart();
      setCart(res.data || []);
    } catch (error) {
      message.error('加载购物车失败');
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }
    try {
      await userApi.updateCart(id, { product_id: 0, quantity });
      loadCart();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const removeFromCart = async (id) => {
    try {
      await userApi.removeFromCart(id);
      message.success('已删除');
      loadCart();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const clearCart = async () => {
    try {
      await userApi.clearCart();
      message.success('购物车已清空');
      loadCart();
    } catch (error) {
      message.error('清空失败');
    }
  };

  const getTotalAmount = () => {
    return selectedRowKeys.reduce((total, key) => {
      const item = cart.find((i) => i.id === key);
      return total + (item?.product?.price || 0) * (item?.quantity || 0);
    }, 0);
  };

  const goCheckout = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要结算的商品');
      return;
    }
    navigate('/checkout', { state: { cartIds: selectedRowKeys } });
  };

  const columns = [
    {
      title: '商品',
      dataIndex: 'product',
      render: (product) => (
        <Space>
          <img
            src={product?.image || 'https://picsum.photos/80/80'}
            alt={product?.name}
            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{product?.name}</div>
            <div style={{ color: '#ff4d4f' }}>¥{product?.price}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '单价',
      dataIndex: ['product', 'price'],
      render: (price) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{price}</span>,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      render: (qty, record) => (
        <InputNumber
          min={0}
          max={record.product?.stock}
          value={qty}
          onChange={(val) => updateQuantity(record.id, val)}
        />
      ),
    },
    {
      title: '小计',
      dataIndex: 'quantity',
      render: (qty, record) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{(qty * record.product?.price).toFixed(2)}</span>
      ),
    },
    {
      title: '操作',
      render: (_, record) => (
        <Popconfirm title="确定要删除吗？" onConfirm={() => removeFromCart(record.id)}>
          <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px 50px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Card title={<span><ShoppingCartOutlined /> 购物车</span>}>
            {cart.length === 0 ? (
              <Empty description="购物车是空的" />
            ) : (
              <>
                <Table
                  rowKey="id"
                  rowSelection={rowSelection}
                  columns={columns}
                  dataSource={cart}
                  pagination={false}
                />
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <Popconfirm title="确定清空购物车？" onConfirm={clearCart}>
                      <Button>清空购物车</Button>
                    </Popconfirm>
                  </Space>
                  <Space>
                    <span>已选 {selectedRowKeys.length} 件商品</span>
                    <span style={{ fontSize: 18 }}>
                      合计：<span style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: 24 }}>¥{getTotalAmount().toFixed(2)}</span>
                    </span>
                    <Button type="primary" size="large" onClick={goCheckout} loading={loading}>
                      去结算
                    </Button>
                  </Space>
                </div>
              </>
            )}
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
