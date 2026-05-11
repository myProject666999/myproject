import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Input, Modal, message, Popconfirm, Space, Select, DatePicker, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../utils/request';
import dayjs from 'dayjs';

const { Option } = Select;

function RewardList() {
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const loadData = async (page = 1, pageSize = 10, searchParams = {}) => {
    setLoading(true);
    try {
      const params = { page, pageSize, ...searchParams };
      const res = await api.get('/rewards', { params });
      setData(res.data.list || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Load rewards error:', error);
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
    setEditingRecord(null);
    modalForm.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    const recordToEdit = {
      ...record,
      date: record.date ? dayjs(record.date) : null,
    };
    setEditingRecord(recordToEdit);
    modalForm.setFieldsValue(recordToEdit);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/rewards/${id}`);
      message.success('删除成功');
      loadData(pagination.current, pagination.pageSize, form.getFieldsValue());
    } catch (error) {
      console.error('Delete reward error:', error);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      if (values.date) {
        values.date = values.date.format('YYYY-MM-DD');
      }
      if (editingRecord) {
        await api.put(`/rewards/${editingRecord.id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/rewards', values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData(pagination.current, pagination.pageSize, form.getFieldsValue());
    } catch (error) {
      console.error('Save reward error:', error);
    }
  };

  const columns = [
    { title: '学号', dataIndex: 'student_no', key: 'student_no' },
    { title: '学生姓名', dataIndex: 'student_name', key: 'student_name' },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) =>
        type === 'reward' ? (
          <Tag color="green">奖励</Tag>
        ) : (
          <Tag color="red">惩罚</Tag>
        ),
    },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '级别', dataIndex: 'level', key: 'level' },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (text) => (text ? dayjs(text).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 className="page-title">奖惩管理</h2>

      <Form form={form} layout="inline" className="search-form">
        <Form.Item name="student_no" label="学号">
          <Input placeholder="请输入学号" />
        </Form.Item>
        <Form.Item name="student_name" label="姓名">
          <Input placeholder="请输入姓名" />
        </Form.Item>
        <Form.Item name="type" label="类型">
          <Select placeholder="请选择类型" allowClear style={{ width: 120 }}>
            <Option value="reward">奖励</Option>
            <Option value="punishment">惩罚</Option>
          </Select>
        </Form.Item>
        <Form.Item name="title" label="标题">
          <Input placeholder="请输入标题" />
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
          新增奖惩
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
        title={editingRecord ? '编辑奖惩' : '新增奖惩'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={modalForm} layout="vertical">
          <Form.Item name="student_id" label="学生ID" rules={[{ required: true, message: '请输入学生ID' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="student_no" label="学号" rules={[{ required: true, message: '请输入学号' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="student_name" label="学生姓名" rules={[{ required: true, message: '请输入学生姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select>
              <Option value="reward">奖励</Option>
              <Option value="punishment">惩罚</Option>
            </Select>
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="level" label="级别">
            <Select>
              <Option value="校级">校级</Option>
              <Option value="市级">市级</Option>
              <Option value="省级">省级</Option>
              <Option value="国家级">国家级</Option>
            </Select>
          </Form.Item>
          <Form.Item name="date" label="日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="content" label="内容">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="description" label="详细描述">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default RewardList;
