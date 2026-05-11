import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Input, Modal, message, Popconfirm, Space, Select, Tag, Descriptions, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined, EyeOutlined, MessageOutlined } from '@ant-design/icons';
import api from '../utils/request';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

function MessageList() {
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [replyForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [replyVisible, setReplyVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));

  const loadData = async (page = 1, pageSize = 10, searchParams = {}) => {
    setLoading(true);
    try {
      const params = { page, pageSize, ...searchParams };
      const res = await api.get('/messages', { params });
      setData(res.data.list || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    loadData(1, pagination.pageSize, values);
    setPagination({ ...pagination, current: 1 });
  };

  const handleReset = () => {
    form.resetFields();
    loadData();
  };

  const handleAdd = () => {
    modalForm.resetFields();
    setModalVisible(true);
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  const handleReply = (record) => {
    setSelectedRecord(record);
    replyForm.setFieldsValue({ reply: record.reply || '' });
    setReplyVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/messages/${id}`);
      message.success('删除成功');
      loadData(pagination.current, pagination.pageSize, form.getFieldsValue());
    } catch (error) {
      console.error('Delete message error:', error);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      await api.post('/messages', values);
      message.success('留言成功');
      setModalVisible(false);
      loadData(pagination.current, pagination.pageSize, form.getFieldsValue());
    } catch (error) {
      console.error('Create message error:', error);
    }
  };

  const handleReplyOk = async () => {
    try {
      const values = await replyForm.validateFields();
      await api.put(`/messages/${selectedRecord.id}/reply`, values);
      message.success('回复成功');
      setReplyVisible(false);
      loadData(pagination.current, pagination.pageSize, form.getFieldsValue());
    } catch (error) {
      console.error('Reply message error:', error);
    }
  };

  const statusColors = {
    unreplied: 'orange',
    replied: 'green',
  };

  const statusTexts = {
    unreplied: '未回复',
    replied: '已回复',
  };

  const canReply = user.role !== 'student';

  const columns = [
    { title: '留言人', dataIndex: 'sender_name', key: 'sender_name' },
    { 
      title: '角色', 
      dataIndex: 'sender_role', 
      key: 'sender_role',
      render: (role) => {
        const roleMap = {
          admin: '管理员',
          teacher: '教师',
          student: '学生',
        };
        return roleMap[role] || role;
      }
    },
    { title: '标题', dataIndex: 'title', key: 'title' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusColors[status] || 'default'}>{statusTexts[status] || status}</Tag>,
    },
    {
      title: '留言时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '回复时间',
      dataIndex: 'reply_time',
      key: 'reply_time',
      render: (text) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            详情
          </Button>
          {canReply && (
            <Button type="link" icon={<MessageOutlined />} onClick={() => handleReply(record)}>
              回复
            </Button>
          )}
          {user.role === 'admin' && (
            <Popconfirm title="确定要删除吗？" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 className="page-title">留言板管理</h2>

      <Form form={form} layout="inline" className="search-form">
        <Form.Item name="title" label="标题">
          <Input placeholder="请输入标题" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="sender_name" label="留言人">
          <Input placeholder="请输入留言人" />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select placeholder="请选择状态" allowClear style={{ width: 120 }}>
            <Option value="unreplied">未回复</Option>
            <Option value="replied">已回复</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <div className="table-toolbar">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增留言
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize });
            loadData(page, pageSize, form.getFieldsValue());
          },
        }}
      />

      <Modal
        title="新增留言"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={modalForm} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="留言内容" rules={[{ required: true, message: '请输入留言内容' }]}>
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="留言详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {selectedRecord && (
          <Card>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="标题">{selectedRecord.title}</Descriptions.Item>
              <Descriptions.Item label="留言人">
                {selectedRecord.sender_name} ({selectedRecord.sender_role === 'admin' ? '管理员' : selectedRecord.sender_role === 'teacher' ? '教师' : '学生'})
              </Descriptions.Item>
              <Descriptions.Item label="留言时间">
                {dayjs(selectedRecord.created_at).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="留言内容">{selectedRecord.content}</Descriptions.Item>
              {selectedRecord.reply && (
                <>
                  <Descriptions.Item label="回复内容">{selectedRecord.reply}</Descriptions.Item>
                  <Descriptions.Item label="回复时间">
                    {selectedRecord.reply_time ? dayjs(selectedRecord.reply_time).format('YYYY-MM-DD HH:mm:ss') : '-'}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </Card>
        )}
      </Modal>

      <Modal
        title="回复留言"
        open={replyVisible}
        onOk={handleReplyOk}
        onCancel={() => setReplyVisible(false)}
        width={600}
      >
        {selectedRecord && (
          <div style={{ marginBottom: 16 }}>
            <p><strong>留言标题：</strong>{selectedRecord.title}</p>
            <p><strong>留言内容：</strong>{selectedRecord.content}</p>
          </div>
        )}
        <Form form={replyForm} layout="vertical">
          <Form.Item name="reply" label="回复内容" rules={[{ required: true, message: '请输入回复内容' }]}>
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MessageList;
