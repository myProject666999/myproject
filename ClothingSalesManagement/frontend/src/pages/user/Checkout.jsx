import { useState, useEffect } from 'react';
import { Layout, Card, Radio, Button, Form, Input, message, Table, Space, Modal } from 'antd';
import { CreditCardOutlined, HomeOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { userApi } from '../../api';

const { Content } = Layout;

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartIds = location.state?.cartIds || [];
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [form] = Form.useForm();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (cartIds.length === 0) {
      navigate('/cart');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cartRes, addressRes] = await Promise.all([
        userApi.getCart(),
        userApi.getAddresses(),
      ]);
      const items = cartRes.data?.filter((item) => cartIds.includes(item.id)) || [];
      setCartItems(items);
      setAddresses(addressRes.data || []);
      if (addressRes.data?.length > 0) {
        const defaultAddr = addressRes.data.find((a) => a.is_default === 1) || addressRes.data[0];
        setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      message.error('加载数据失败');
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + item.quantity * item.product.price, 0);
  };

  const submitOrder = async () => {
    if (!selectedAddress) {
      message.warning('请选择收货地址');
      return;
    }
    setLoading(true);
    try {
      const orderRes = await userApi.createOrder({
        cart_ids: cartIds,
        address_id: selectedAddress.id,
      });

      Modal.confirm({
        title: '订单创建成功',
        content: `订单号：${orderRes.data.order_no}，是否立即支付？`,
        okText: '立即支付',
        cancelText: '稍后支付',
        onOk: async () => {
          await userApi.payOrder(orderRes.data.id);
          message.success('支付成功');
          navigate('/orders');
        },
        onCancel: () => {
          navigate('/orders');
        },
      });
    } catch (error) {
      message.error(error.message || '下单失败');
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async (values) => {
    try {
      await userApi.createAddress(values);
      message.success('地址添加成功');
      setShowAddressModal(false);
      form.resetFields();
      loadData();
    } catch (error) {
      message.error(error.message || '添加失败');
    }
  };

  const columns = [
    {
      title: '商品',
      dataIndex: ['product', 'name'],
    },
    {
      title: '单价',
      dataIndex: ['product', 'price'],
      render: (price) => <span style={{ color: '#ff4d4f' }}>¥{price}</span>,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
    },
    {
      title: '小计',
      render: (_, record) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
          ¥{(record.quantity * record.product.price).toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px 50px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Card title="确认订单" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}><HomeOutlined /> 收货地址</h3>
                <Button type="link" icon={<PlusOutlined />} onClick={() => setShowAddressModal(true)}>
                  新增地址
                </Button>
              </div>
              <Radio.Group
                value={selectedAddress?.id}
                onChange={(e) => setSelectedAddress(addresses.find((a) => a.id === e.target.value))}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {addresses.map((addr) => (
                    <Radio key={addr.id} value={addr.id}>
                      <div>
                        <strong>{addr.name}</strong> {addr.phone}
                        <div style={{ color: '#666' }}>
                          {addr.province} {addr.city} {addr.district} {addr.detail}
                        </div>
                      </div>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Space>
          </Card>

          <Card title="商品清单" style={{ marginBottom: 16 }}>
            <Table rowKey="id" columns={columns} dataSource={cartItems} pagination={false} />
          </Card>

          <Card>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 18, marginRight: 16 }}>
                订单总金额：
                <span style={{ color: '#ff4d4f', fontSize: 28, fontWeight: 'bold' }}>¥{getTotalAmount().toFixed(2)}</span>
              </span>
              <Button
                type="primary"
                size="large"
                icon={<CreditCardOutlined />}
                onClick={submitOrder}
                loading={loading}
              >
                提交订单
              </Button>
            </div>
          </Card>
        </div>
      </Content>

      <Modal
        title="新增收货地址"
        open={showAddressModal}
        onCancel={() => setShowAddressModal(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={saveAddress}>
          <Form.Item name="name" label="收货人" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="province" label="省份">
            <Input />
          </Form.Item>
          <Form.Item name="city" label="城市">
            <Input />
          </Form.Item>
          <Form.Item name="district" label="区/县">
            <Input />
          </Form.Item>
          <Form.Item name="detail" label="详细地址" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="is_default" initialValue={0}>
            <Radio.Group>
              <Radio value={1}>设为默认地址</Radio>
              <Radio value={0}>不设为默认</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>保存</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
