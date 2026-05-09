import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Switch, Typography, Tabs, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { bagAPI } from '../../services/api';

const { Title } = Typography;

function Bags() {
  const [activeTab, setActiveTab] = useState('list');
  const [list, setList] = useState([]);
  const [types, setTypes] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [total, setTotal] = useState(0);
  const [pTotal, setPTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pPage, setPPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [form] = Form.useForm();
  const [typeForm] = Form.useForm();

  useEffect(() => {
    loadList();
    loadTypes();
  }, [page, activeTab]);

  useEffect(() => {
    if (activeTab === 'purchases') loadPurchases();
  }, [pPage, activeTab]);

  const loadList = async () => {
    try {
      const res = await bagAPI.getAdminList({ page, page_size: 10 });
      setList(res.data.data?.list || []);
      setTotal(res.data.data?.total || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const loadTypes = async () => {
    try {
      const res = await bagAPI.getAdminTypes();
      setTypes(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadPurchases = async () => {
    try {
      const res = await bagAPI.getPurchases({ page: pPage, page_size: 10 });
      setPurchases(res.data.data?.list || []);
      setPTotal(res.data.data?.total || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue(item);
    } else {
      form.resetFields();
      form.setFieldsValue({ status: 1, stock: 0, price: 0 });
    }
    setModalOpen(true);
  };

  const openTypeModal = (item = null) => {
    setEditingType(item);
    if (item) {
      typeForm.setFieldsValue(item);
    } else {
      typeForm.resetFields();
    }
    setTypeModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        await bagAPI.update(editingItem.id, values);
        message.success('更新成功');
      } else {
        await bagAPI.create(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      loadList();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleTypeSubmit = async (values) => {
    try {
      if (editingType) {
        await bagAPI.updateType(editingType.id, values);
        message.success('更新成功');
      } else {
        await bagAPI.createType(values);
        message.success('创建成功');
      }
      setTypeModalOpen(false);
      loadTypes();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await bagAPI.delete(id);
      message.success('删除成功');
      loadList();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleTypeDelete = async (id) => {
    try {
      await bagAPI.deleteType(id);
      message.success('删除成功');
      loadTypes();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const listColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: ['bag_type', 'name'], key: 'type' },
    { title: '价格', dataIndex: 'price', key: 'price', render: v => `¥${v}` },
    { title: '库存', dataIndex: 'stock', key: 'stock' },
    { title: '状态', dataIndex: 'status', key: 'status', render: v => v === 1 ? '上架' : '下架' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openModal(record)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const typeColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '颜色', dataIndex: 'color', key: 'color' },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openTypeModal(record)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleTypeDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const purchaseColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '学生', dataIndex: ['student', 'real_name'], key: 'student' },
    { title: '垃圾袋', dataIndex: ['bag', 'name'], key: 'bag' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '总价', dataIndex: 'total_price', key: 'total', render: v => `¥${v}` },
    { title: '时间', dataIndex: 'created_at', key: 'time', render: v => new Date(v).toLocaleString() }
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>🛍️ 垃圾袋管理</Title>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'list',
            label: '垃圾袋列表',
            children: (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>新增</Button>
                </div>
                <Table columns={listColumns} dataSource={list} rowKey="id" pagination={{ current: page, total, pageSize: 10, onChange: setPage }} />
              </>
            )
          },
          {
            key: 'types',
            label: '类型管理',
            children: (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => openTypeModal()}>新增类型</Button>
                </div>
                <Table columns={typeColumns} dataSource={types} rowKey="id" pagination={false} />
              </>
            )
          },
          {
            key: 'purchases',
            label: '购买记录',
            children: (
              <Table columns={purchaseColumns} dataSource={purchases} rowKey="id" pagination={{ current: pPage, total: pTotal, pageSize: 10, onChange: setPPage }} />
            )
          }
        ]}
      />

      <Modal title={editingItem ? '编辑' : '新增'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="type_id" label="类型" rules={[{ required: true }]}>
            <Select>{types.map(t => <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>)}</Select>
          </Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="price" label="价格"><InputNumber min={0} step={0.01} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="stock" label="库存"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="image" label="图片URL"><Input /></Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked"><Switch checkedChildren="上架" unCheckedChildren="下架" /></Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" block>提交</Button></Form.Item>
        </Form>
      </Modal>

      <Modal title={editingType ? '编辑类型' : '新增类型'} open={typeModalOpen} onCancel={() => setTypeModalOpen(false)} footer={null}>
        <Form form={typeForm} layout="vertical" onFinish={handleTypeSubmit}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="color" label="颜色"><Input /></Form.Item>
          <Form.Item name="sort" label="排序"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" block>提交</Button></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Bags;
