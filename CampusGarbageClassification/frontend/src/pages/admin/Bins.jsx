import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Switch, Typography, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { binAPI } from '../../services/api';

const { Title } = Typography;

function Bins() {
  const [list, setList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadList();
  }, []);

  const loadList = async () => {
    try {
      const res = await binAPI.getList();
      setList(res.data.data || []);
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
      form.setFieldsValue({ status: 1, capacity: 50 });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        await binAPI.update(editingItem.id, values);
        message.success('更新成功');
      } else {
        await binAPI.create(values);
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
      await binAPI.delete(id);
      message.success('删除成功');
      loadList();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '位置', dataIndex: 'location', key: 'location' },
    { title: '容量(L)', dataIndex: 'capacity', key: 'capacity' },
    { title: '状态', dataIndex: 'status', key: 'status', render: v => v === 1 ? <span style={{ color: '#52c41a' }}>可用</span> : <span style={{ color: '#ff4d4f' }}>损坏</span> },
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>🗑️ 垃圾桶管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>新增</Button>
      </div>

      <Table columns={columns} dataSource={list} rowKey="id" pagination={false} />

      <Modal title={editingItem ? '编辑' : '新增'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="location" label="位置"><Input /></Form.Item>
          <Form.Item name="capacity" label="容量(L)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked"><Switch checkedChildren="可用" unCheckedChildren="损坏" /></Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" block>提交</Button></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Bins;
