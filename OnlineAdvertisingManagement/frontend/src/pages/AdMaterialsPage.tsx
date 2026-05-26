import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, message, Popconfirm, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { adMaterialApi } from '../services/api';

const AdMaterialsPage: React.FC = () => {
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
      const res = await adMaterialApi.getAll();
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
      await adMaterialApi.delete(id);
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
        await adMaterialApi.update(editingItem.id, values);
        message.success('更新成功');
      } else {
        await adMaterialApi.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadList();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '素材名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
    {
      title: '预览',
      dataIndex: 'fileUrl',
      key: 'preview',
      width: 100,
      render: (url: string) =>
        url ? <Image width={60} height={40} src={url} /> : '-',
    },
    { title: '跳转链接', dataIndex: 'linkUrl', key: 'linkUrl', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
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
        <h2>素材管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增素材
        </Button>
      </div>
      <Table columns={columns} dataSource={list} rowKey="id" loading={loading} />

      <Modal
        title={editingItem ? '编辑素材' : '新增素材'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="素材名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="素材类型" rules={[{ required: true }]} initialValue="image">
            <Select>
              <Select.Option value="image">图片</Select.Option>
              <Select.Option value="video">视频</Select.Option>
              <Select.Option value="text">文字</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="fileUrl" label="文件地址" rules={[{ required: true }]}>
            <Input placeholder="请输入文件URL" />
          </Form.Item>
          <Form.Item name="linkUrl" label="跳转链接">
            <Input placeholder="点击后跳转的URL" />
          </Form.Item>
          <Form.Item name="width" label="宽度(px)">
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="height" label="高度(px)">
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdMaterialsPage;
