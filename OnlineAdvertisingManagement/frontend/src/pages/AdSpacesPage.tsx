import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { adSpaceApi } from '../services/api';

const AdSpacesPage: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadList();
  }, []);

  const loadList = async () => {
    setLoading(true);
    try {
      const res = await adSpaceApi.getAll();
      setList(res.data || []);
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await adSpaceApi.delete(id);
      message.success('删除成功');
      loadList();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await adSpaceApi.update(editingItem.id, values);
        message.success('更新成功');
      } else {
        await adSpaceApi.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadList();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '广告位名称', dataIndex: 'name', key: 'name' },
    { title: '广告位代码', dataIndex: 'code', key: 'code' },
    { title: '尺寸', dataIndex: 'id', key: 'size', render: (_: any, record: any) => `${record.width} × ${record.height}` },
    { title: '位置', dataIndex: 'position', key: 'position' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (status === 1 ? '启用' : '禁用'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>广告位管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增广告位
        </Button>
      </div>
      <Table columns={columns} dataSource={list} rowKey="id" loading={loading} />

      <Modal
        title={editingItem ? '编辑广告位' : '新增广告位'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="广告位名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="广告位代码" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="width" label="宽度(px)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="height" label="高度(px)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="position" label="位置描述" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdSpacesPage;
