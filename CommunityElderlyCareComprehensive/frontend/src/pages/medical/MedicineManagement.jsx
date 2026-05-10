import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { medicineApi } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const MedicineManagement = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchKeyword, setSearchKeyword] = useState('');
  const { isAdmin, isDoctor } = useAuth();

  const canEdit = isAdmin() || isDoctor();

  const fetchList = async (page = 1, pageSize = 10, keyword = '') => {
    setLoading(true);
    try {
      const result = await medicineApi.list({ page, page_size: pageSize, keyword });
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

  useEffect(() => {
    fetchList();
  }, []);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    await medicineApi.delete(id);
    message.success('删除成功');
    fetchList(pagination.current, pagination.pageSize, searchKeyword);
  };

  const handleSubmit = async (values) => {
    if (editingRecord) {
      await medicineApi.update(editingRecord.id, values);
      message.success('更新成功');
    } else {
      await medicineApi.create(values);
      message.success('创建成功');
    }
    setModalVisible(false);
    fetchList(pagination.current, pagination.pageSize, searchKeyword);
  };

  const handleSearch = () => {
    fetchList(1, pagination.pageSize, searchKeyword);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '药品名称', dataIndex: 'name', key: 'name' },
    { title: '通用名', dataIndex: 'generic_name', key: 'generic_name' },
    { title: '生产厂家', dataIndex: 'manufacturer', key: 'manufacturer' },
    { title: '规格', dataIndex: 'specification', key: 'specification' },
    { title: '剂型', dataIndex: 'dosage_form', key: 'dosage_form' },
    { title: '价格', dataIndex: 'price', key: 'price', render: (price) => `¥${price}` },
    { title: '库存', dataIndex: 'stock', key: 'stock' },
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
      <h2>药物管理</h2>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input
          placeholder="搜索药品名称/通用名/生产厂家"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 300 }}
          prefix={<SearchOutlined />}
        />
        <Button type="primary" onClick={handleSearch}>搜索</Button>
        {canEdit && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加药物
          </Button>
        )}
      </div>
      <Table
        columns={columns}
        dataSource={list}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => fetchList(page, pageSize, searchKeyword)
        }}
      />
      <Modal
        title={editingRecord ? '编辑药物' : '添加药物'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="药品名称"
            rules={[{ required: true, message: '请输入药品名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="generic_name" label="通用名">
            <Input />
          </Form.Item>
          <Form.Item name="manufacturer" label="生产厂家">
            <Input />
          </Form.Item>
          <Form.Item name="specification" label="规格">
            <Input />
          </Form.Item>
          <Form.Item name="dosage_form" label="剂型">
            <Input />
          </Form.Item>
          <Form.Item name="price" label="价格">
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock" label="库存">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicineManagement;
