import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Tag, InputNumber, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MessageOutlined, CheckOutlined } from '@ant-design/icons';
import request from '../../utils/request';

function MessageManage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await request.get(`/admin/messages?page=${page}&page_size=${pageSize}`);
      setData(res.data?.list || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      message.error('加载失败');
    }
    setLoading(false);
  };

  const handleReply = (record) => {
    setCurrentMessage(record);
    form.setFieldsValue({ reply: record.reply || '' });
    setReplyModalVisible(true);
  };

  const handleSubmitReply = async (values) => {
    try {
      await request.put(`/admin/messages/${currentMessage.id}/reply`, values);
      message.success('回复成功');
      setReplyModalVisible(false);
      loadData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await request.delete(`/admin/messages/${id}`);
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
    { title: '留言内容', dataIndex: 'content', key: 'content', ellipsis: true },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'orange'}>
          {status === 1 ? '已回复' : '待回复'}
        </Tag>
      )
    },
    { 
      title: '留言时间', 
      dataIndex: 'created_at', 
      key: 'created_at',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<MessageOutlined />} onClick={() => handleReply(record)}>回复</Button>
          <Popconfirm title="确定要删除吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>留言管理</h2>
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

      <Modal
        title="回复留言"
        open={replyModalVisible}
        onCancel={() => setReplyModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
          <strong>用户留言：</strong>
          <p style={{ marginTop: 8, marginBottom: 0 }}>{currentMessage?.content}</p>
        </div>
        <Form form={form} layout="vertical" onFinish={handleSubmitReply}>
          <Form.Item name="reply" label="回复内容" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="请输入回复内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MessageManage;
