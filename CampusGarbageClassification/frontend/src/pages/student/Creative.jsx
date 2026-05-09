import React, { useEffect, useState } from 'react';
import { Card, Typography, Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { creativeAPI } from '../../services/api';

const { Title } = Typography;

function CreativePage() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [types, setTypes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadList();
    loadTypes();
  }, []);

  const loadList = async () => {
    try {
      const res = await creativeAPI.getMyList();
      setList(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadTypes = async () => {
    try {
      const res = await creativeAPI.getTypes();
      setTypes(res.data.data || []);
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
    }
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        await creativeAPI.update(editingItem.id, values);
        message.success('更新成功');
      } else {
        await creativeAPI.create(values);
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
      await creativeAPI.delete(id);
      message.success('删除成功');
      loadList();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '类型', dataIndex: ['type', 'name'], key: 'type', render: v => v || '-' },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', render: v => new Date(v).toLocaleDateString() },
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

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/profile')}>
          返回会员中心
        </Button>
      </Card>

      <Card
        title={<Title level={3} style={{ margin: 0 }}>💡 我的创意信息</Title>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>发布创意</Button>}
      >
        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑创意' : '发布创意'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="type_id" label="创意类型" rules={[{ required: true }]}>
            <Select placeholder="请选择类型">
              {types.map(t => (
                <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}>
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>提交</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default CreativePage;
