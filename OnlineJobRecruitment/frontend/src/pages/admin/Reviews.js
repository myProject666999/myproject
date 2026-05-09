import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message, Space, Popconfirm, Tag, Rate, Input } from 'antd';
import { DeleteOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { reviewApi } from '../../services/api';

const Reviews = () => {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = { page, page_size: pageSize };
      const data = await reviewApi.getAllReviews(params);
      setList(data?.list || []);
      setTotal(data?.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await reviewApi.deleteReview(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleView = (record) => {
    setCurrentReview(record);
    setDetailVisible(true);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      render: (user) => user?.name || user?.username || '-',
    },
    {
      title: '职位',
      dataIndex: 'job',
      key: 'job',
      render: (job) => job?.title || '-',
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 150,
      render: (rating) => <Rate disabled value={rating} />,
    },
    { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 200,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>详情</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3>评价管理</h3>
      </div>
      <Table
        columns={columns}
        dataSource={list}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize,
          onChange: setPage,
          showSizeChanger: false,
        }}
      />

      <Modal
        title="评价详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>关闭</Button>,
        ]}
        width={600}
      >
        {currentReview && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontWeight: 'bold' }}>用户：</span>
              {currentReview.user?.name || currentReview.user?.username || '-'}
            </div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontWeight: 'bold' }}>职位：</span>
              {currentReview.job?.title || '-'}
            </div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontWeight: 'bold' }}>评分：</span>
              <Rate disabled value={currentReview.rating} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontWeight: 'bold' }}>评价内容：</span>
              <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                {currentReview.content}
              </div>
            </div>
            <div style={{ color: '#999', fontSize: 12 }}>
              创建时间：{currentReview.created_at}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reviews;
