import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Select, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { insuranceApi, userApi } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const InsuranceManagement = () => {
  const [list, setList] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const { isAdmin, isDoctor } = useAuth();

  const canEdit = isAdmin() || isDoctor();

  const fetchList = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const result = await insuranceApi.list({ page, page_size: pageSize });
      setList(result.list || []);
      setPagination({
        current: result.page || 1,
        pageSize: result.pageSize || 10,
        total: result.total || 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (canEdit) {
      const result = await userApi.list({ page: 1, page_size: 1000 });
      setUsers(result.list || []);
    }
  };

  useEffect(() => {
    fetchList();
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      user_id: record.user_id,
      insurance_number: record.insurance_number,
      insurance_type: record.insurance_type,
      card_number: record.card_number,
      status: record.status,
      start_date: record.start_date ? dayjs(record.start_date) : null,
      end_date: record.end_date ? dayjs(record.end_date) : null
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    await insuranceApi.delete(id);
    message.success('删除成功');
    fetchList(pagination.current, pagination.pageSize);
  };

  const handleSubmit = async (values) => {
    const data = {
      ...values,
      start_date: values.start_date?.toISOString(),
      end_date: values.end_date?.toISOString()
    };

    if (editingRecord) {
      await insuranceApi.update(editingRecord.id, data);
      message.success('更新成功');
    } else {
      await insuranceApi.create(data);
      message.success('创建成功');
    }
    setModalVisible(false);
    fetchList(pagination.current, pagination.pageSize);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '居民',
      dataIndex: 'user',
      key: 'user',
      render: (user) => user?.real_name || user?.username
    },
    { title: '医保号', dataIndex: 'insurance_number', key: 'insurance_number' },
    { title: '医保类型', dataIndex: 'insurance_type', key: 'insurance_type' },
    { title: '卡号', dataIndex: 'card_number', key: 'card_number' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '开始日期', dataIndex: 'start_date', key: 'start_date' },
    { title: '结束日期', dataIndex: 'end_date', key: 'end_date' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {canEdit && (
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
              编辑
            </Button>
          )}
          {isAdmin() && (
            <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <h2>医保信息</h2>
      {canEdit && (
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加医保信息
          </Button>
        </div>
      )}
      <Table
        columns={columns}
        dataSource={list}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: fetchList
        }}
      />
      <Modal
        title={editingRecord ? '编辑医保信息' : '添加医保信息'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="user_id"
            label="居民"
            rules={[{ required: true, message: '请选择居民' }]}
          >
            <Select
              placeholder="请选择居民"
              options={users.map(u => ({ value: u.id, label: u.real_name || u.username }))}
            />
          </Form.Item>
          <Form.Item
            name="insurance_number"
            label="医保号"
            rules={[{ required: true, message: '请输入医保号' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="insurance_type" label="医保类型">
            <Select
              placeholder="请选择医保类型"
              options={[
                { value: '城镇职工', label: '城镇职工' },
                { value: '城乡居民', label: '城乡居民' },
                { value: '新农合', label: '新农合' }
              ]}
            />
          </Form.Item>
          <Form.Item name="card_number" label="卡号">
            <Input />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              placeholder="请选择状态"
              options={[
                { value: '正常', label: '正常' },
                { value: '暂停', label: '暂停' },
                { value: '终止', label: '终止' }
              ]}
            />
          </Form.Item>
          <Form.Item name="start_date" label="开始日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="end_date" label="结束日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InsuranceManagement;
