import { useState, useEffect } from 'react';
import { Layout, Card, Table, Button, Tag, message, Modal, Space } from 'antd';
import { CreditCardOutlined, EyeOutlined } from '@ant-design/icons';
import { userApi } from '../../api';

const { Content } = Layout;

const orderStatusMap = {
  '-1': { text: '已关闭', color: 'default' },
  0: { text: '待支付', color: 'warning' },
  1: { text: '已支付', color: 'processing' },
  2: { text: '配货中', color: 'processing' },
  3: { text: '已出库', color: 'success' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadOrders();
  }, [page]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await userApi.getOrders({ page, page_size: 10 });
      setOrders(res.data?.list || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      message.error('加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (order) => {
    Modal.confirm({
      title: '确认支付',
      content: `订单号：${order.order_no}，金额：¥${order.total_amount}`,
      onOk: async () => {
        try {
          await userApi.payOrder(order.id);
          message.success('支付成功');
          loadOrders();
        } catch (error) {
          message.error('支付失败');
        }
      },
    });
  };

  const viewDetail = (order) => {
    Modal.info({
      title: `订单详情 - ${order.order_no}`,
      width: 800,
      content: (
        <div>
          <p>订单状态：<Tag color={orderStatusMap[order.status]?.color}>{orderStatusMap[order.status]?.text}</Tag></p>
          <p>下单时间：{new Date(order.created_at).toLocaleString()}</p>
          <p>订单金额：<span style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: 18 }}>¥{order.total_amount}</span></p>
          <h4>商品清单：</h4>
          <Table
            rowKey="id"
            dataSource={order.items || []}
            pagination={false}
            columns={[
              { title: '商品名称', dataIndex: 'product_name' },
              {
                title: '图片',
                dataIndex: 'product_image',
                render: (img) => (
                  <img src={img || 'https://picsum.photos/50/50'} alt="" style={{ width: 50, height: 50, objectFit: 'cover' }} />
                ),
              },
              { title: '单价', dataIndex: 'price', render: (p) => `¥${p}` },
              { title: '数量', dataIndex: 'quantity' },
              { title: '小计', render: (_, r) => `¥${(r.price * r.quantity).toFixed(2)}` },
            ]}
          />
        </div>
      ),
    });
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'order_no',
    },
    {
      title: '商品数量',
      render: (_, record) => record.items?.length || 0,
    },
    {
      title: '订单金额',
      dataIndex: 'total_amount',
      render: (amount) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{amount}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status) => {
        const info = orderStatusMap[status] || { text: '未知', color: 'default' };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '下单时间',
      dataIndex: 'created_at',
      render: (t) => new Date(t).toLocaleString(),
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => viewDetail(record)}>
            详情
          </Button>
          {record.status === 0 && (
            <Button type="primary" size="small" icon={<CreditCardOutlined />} onClick={() => handlePay(record)}>
              立即支付
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px 50px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Card title="我的订单">
            <Table
              rowKey="id"
              columns={columns}
              dataSource={orders}
              loading={loading}
              pagination={{
                current: page,
                total,
                pageSize: 10,
                onChange: setPage,
              }}
            />
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
