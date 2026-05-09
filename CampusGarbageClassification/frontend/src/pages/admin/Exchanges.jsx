import React, { useEffect, useState } from 'react';
import { Table, Typography, Tag } from 'antd';
import { productAPI } from '../../services/api';

const { Title } = Typography;

function Exchanges() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadList();
  }, [page]);

  const loadList = async () => {
    try {
      const res = await productAPI.getExchanges({ page, page_size: 10 });
      setList(res.data.data?.list || []);
      setTotal(res.data.data?.total || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '学生', dataIndex: ['student', 'real_name'], key: 'student' },
    { title: '商品', dataIndex: ['product', 'name'], key: 'product' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '消耗积分', dataIndex: 'total_points', key: 'points', render: v => <Tag color="red">-{v}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', render: v => v === 1 ? <Tag color="green">已完成</Tag> : <Tag color="orange">处理中</Tag> },
    { title: '时间', dataIndex: 'created_at', key: 'time', render: v => new Date(v).toLocaleString() }
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>🛒 商品兑换记录</Title>
      <Table columns={columns} dataSource={list} rowKey="id" pagination={{ current: page, total, pageSize: 10, onChange: setPage }} />
    </div>
  );
}

export default Exchanges;
