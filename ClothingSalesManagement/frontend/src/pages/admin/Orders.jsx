import { useState, useEffect } from 'react';
import { Table, Button, Input, Select, message, Space, Tag, Modal } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { adminApi } from '../../api';

const { Option } = Select;

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
  const [orderNo, setOrderNo] = useState('');
  const [status, setStatus] = useState(undefined);

  useEffect(() => {
    loadOrders();
  }, [page, status]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 10 };
      if (orderNo) params.order_no = orderNo;
      if (status !== undefined) params.status = status;

      const res = await adminApi.getOrders(params);
      setOrders(res.data?.list || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadOrders();
  };

  const viewDetail = (order) => {
    Modal.info({
      title: `订单详情 - ${order.order_no}`,
      width: 900,
      content: (
        <div>
          <p>订单状态：<Tag color={orderStatusMap[order.status]?.color}>{orderStatusMap[order.status]?.text}</Tag></p>
          <p>支付状态：{order.pay_status === 1 ? '已支付' : '未支付'}</p>
          <p>支付方式：{order.pay_type || '-'}</p>
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

  const handleShip = async (id) => {
    try {
      await adminApi.shipOrder(id);
      message.success('配货成功');
      loadOrders();
    } catch (error) {
      message.error('配货失败');
    }
  };

  const handleDeliver = async (id) => {
    try {
      await adminApi.deliverOrder(id);
      message.success('出库成功');
      loadOrders();
    } catch (error) {
      message.error('出库失败');
    }
  };

  const handleClose = async (id) => {
    Modal.confirm({
      title: '确认关闭订单？',
      onOk: async () => {
        try {
          await adminApi.closeOrder(id);
          message.success('关闭成功');
          loadOrders();
        } catch (error) {
          message.error('关闭失败');
        }
      },
    });
  };

  const columns = [
    { title: '订单号', dataIndex: 'order_no' },
    {
      title: '订单金额',
      dataIndex: 'total_amount',
      render: (a) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{a}</span>,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      render: (s) => {
        const info = orderStatusMap[s] || { text: '未知', color: 'default' };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '支付状态',
      dataIndex: 'pay_status',
      render: (s) => (s === 1 ? <Tag color="green">已支付</Tag> : <Tag color="warning">未支付</Tag>),
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
          <Button type="link" icon={<EyeOutlined />} onClick={() => viewDetail(record)}>详情</Button>
          {record.status === 1 && (
            <Button type="link" onClick={() => handleShip(record.id)}>配货</Button>
          )}
          {record.status === 2 && (
            <Button type="link" onClick={() => handleDeliver(record.id)}>出库</Button>
          )}
          {record.status !== -1 && (
            <Button type="link" danger onClick={() => handleClose(record.id)}>关闭</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
        <Input
          placeholder="搜索订单号"
          value={orderNo}
          onChange={(e) => setOrderNo(e.target.value)}
          style={{ width: 200 }}
          onPressEnter={handleSearch}
        />
        <Select
          placeholder="状态筛选"
          style={{ width: 150 }}
          allowClear
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
        >
          <Option value={-1}>已关闭</Option>
          <Option value={0}>待支付</Option>
          <Option value={1}>已支付</Option>
          <Option value={2}>配货中</Option>
          <Option value={3}>已出库</Option>
        </Select>
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
      </div>

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
    </div>
  );
}
