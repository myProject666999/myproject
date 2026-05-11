import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Input, Modal, message, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../utils/request';
import dayjs from 'dayjs';

function TeacherList() {
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
      const res = await api.get('/teachers', { params });
      setData(res.data.list || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Load teachers error:', error);
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
    setEditingRecord(record);
    modalForm.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/teachers/${id}`);
      message.success('删除成功');
      loadData(pagination.current, pagination.pageSize, form.getFieldsValue());
    } catch (error) {
      console.error('Delete teacher error:', error);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      if (editingRecord) {
        await api.put(`/teachers/${editingRecord.id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/teachers', values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData(pagination.current, pagination.pageSize, form.getFieldsValue());
    } catch (error) {
      console.error('Save teacher error:', error);
    }
  };

  const columns = [
    { title: '工号', dataIndex: 'teacher_no', key: 'teacher_no' },
    { title: '姓名', dataIndex: 'real_name', key: 'real_name' },
    { title: '性别', dataIndex: 'gender', key: 'gender' },
    { title: '职称', dataIndex: 'title', key: 'title' },
    { title: '部门', dataIndex: 'department', key: 'department' },
    { title: '专业方向', dataIndex: 'major', key: 'major' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '电话', dataIndex: 'phone', key: 'phone' },
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
      <h2 className="page-title">教师信息管理</h2>

      <Form form={form} layout="inline" className="search-form">
        <Form.Item name="teacher_no" label="工号">
          <Input placeholder="请输入工号" />
        </Form.Item>
        <Form.Item name="real_name" label="姓名">
          <Input placeholder="请输入姓名" />
        </Form.Item>
        <Form.Item name="department" label="部门">
          <Input placeholder="请输入部门" />
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
          新增教师
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
        title={editingRecord ? '编辑教师' : '新增教师'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={modalForm} layout="vertical">
          <Form.Item name="teacher_no" label="工号" rules={[{ required: true, message: '请输入工号' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="real_name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Input />
          </Form.Item>
          <Form.Item name="title" label="职称">
            <Input />
          </Form.Item>
          <Form.Item name="department" label="部门">
            <Input />
          </Form.Item>
          <Form.Item name="major" label="专业方向">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default TeacherList;
