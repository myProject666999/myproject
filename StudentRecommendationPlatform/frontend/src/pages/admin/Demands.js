import React, { useState, useEffect } from 'react';
import { Table, Button, message, Popconfirm, Space, Tag, Select } from 'antd';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import request from '../../utils/request';

function Demands() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [page, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await request.get(`/admin/demands?${params.toString()}`);
      setData(res.data?.list || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      message.error('加载失败');
    }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    try {
      const res = await request.put(`/admin/demands/${id}/approve`);
      if (res.code === 200) {
        message.success('审核通过');
        loadData();
      }
    } catch (error) {
      message.error('审核失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await request.delete(`/admin/demands/${id}`);
      if (res.code === 200) {
        message.success('删除成功');
        loadData();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '用户', dataIndex: ['user', 'username'], key: 'user', render: (_, r) => r.user?.username || '-' },
    { title: '需求标题', dataIndex: 'title', key: 'title' },
    { title: '需求描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'orange'}>
          {status === 1 ? '已审核' : '待审核'}
        </Tag>
      )
    },
    { 
      title: '提交时间', 
      dataIndex: 'created_at', 
      key: 'created_at',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status !== 1 && (
            <Button type="link" icon={<CheckOutlined />} onClick={() => handleApprove(record.id)}>审核</Button>
          )}
          <Popconfirm title="确定要删除吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>需求管理</h2>
        <Space>
          <Select
            placeholder="状态筛选"
            value={statusFilter || undefined}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            style={{ width: 150 }}
            allowClear
          >
            <Select.Option value="0">待审核</Select.Option>
            <Select.Option value="1">已审核</Select.Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: setPage,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </div>
  );
}

export default Demands;
