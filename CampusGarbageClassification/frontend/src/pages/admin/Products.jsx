import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Switch, Typography, Tabs, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { productAPI } from '../../services/api';

const { Title } = Typography;

function Products() {
  const [activeTab, setActiveTab] = useState('list');
  const [list, setList] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [total, setTotal] = useState(0);
  const [eTotal, setETotal] = useState(0);
  const [page, setPage] = useState(1);
  const [ePage, setEPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (activeTab === 'list') loadList();
    if (activeTab === 'exchanges') loadExchanges();
  }, [page, ePage, activeTab]);

  const loadList = async () => {
    try {
      const res = await productAPI.getAdminList({ page, page_size: 10 });
      setList(res.data.data?.list || []);
      setTotal(res.data.data?.total || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const loadExchanges = async () => {
    try {
      const res = await productAPI.getExchanges({ page: ePage, page_size: 10 });
      setExchanges(res.data.data?.list || []);
      setETotal(res.data.data?.total || 0);
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
      form.setFieldsValue({ status: 1, stock: 0, points_price: 0, category: '文具' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        await productAPI.update(editingItem.id, values);
        message.success('更新成功');
      } else {
        await productAPI.create(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      loadList();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await productAPI.delete(id);
      message.success('删除成功');
      loadList();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const listColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '分类', dataIndex: 'category', key: 'category' },
    { title: '所需积分', dataIndex: 'points_price', key: 'points' },
    { title: '库存', dataIndex: 'stock', key: 'stock' },
    { title: '状态', dataIndex: 'status', key: 'status', render: v => v === 1 ? '上架' : '下架' },
    {
      title: '操作',
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

  const exchangeColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '学生', dataIndex: ['student', 'real_name'], key: 'student' },
    { title: '商品', dataIndex: ['product', 'name'], key: 'product' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '消耗积分', dataIndex: 'total_points', key: 'points' },
    { title: '时间', dataIndex: 'created_at', key: 'time', render: v => new Date(v).toLocaleString() }
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>🎁 商品管理</Title>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'list',
            label: '商品列表',
            children: (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>新增商品</Button>
                </div>
                <Table columns={listColumns} dataSource={list} rowKey="id" pagination={{ current: page, total, pageSize: 10, onChange: setPage }} />
              </>
            )
          },
          {
            key: 'exchanges',
            label: '兑换记录',
            children: (
              <Table columns={exchangeColumns} dataSource={exchanges} rowKey="id" pagination={{ current: ePage, total: eTotal, pageSize: 10, onChange: setEPage }} />
            )
          }
        ]}
      />

      <Modal title={editingItem ? '编辑商品' : '新增商品'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="category" label="分类">
            <Select>
              <Select.Option value="文具">文具</Select.Option>
              <Select.Option value="生活">生活</Select.Option>
              <Select.Option value="学习">学习</Select.Option>
              <Select.Option value="其他">其他</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="points_price" label="所需积分"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="stock" label="库存"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="image" label="图片URL"><Input /></Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked"><Switch checkedChildren="上架" unCheckedChildren="下架" /></Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" block>提交</Button></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Products;
