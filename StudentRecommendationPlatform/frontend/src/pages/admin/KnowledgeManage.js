import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Select, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import request from '../../utils/request';

function KnowledgeManage() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCategories();
    loadData();
  }, [page]);

  const loadCategories = async () => {
    try {
      const res = await request.get('/categories');
      setCategories(res.data || []);
    } catch (error) {
      console.error('加载分类失败', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await request.get(`/admin/knowledge-points?page=${page}&page_size=${pageSize}`);
      setData(res.data?.list || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      message.error('加载失败');
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await request.delete(`/admin/knowledge-points/${id}`);
      if (res.code === 200) {
        message.success('删除成功');
        loadData();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        await request.put(`/admin/knowledge-points/${editingItem.id}`, values);
        message.success('更新成功');
      } else {
        await request.post('/admin/knowledge-points', values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:8080/api/admin/knowledge-points/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '知识点.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        message.success('导出成功');
      } else {
        message.error('导出失败');
      }
    } catch (error) {
      console.error('导出失败', error);
      message.error('导出失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { 
      title: '分类', 
      dataIndex: ['category', 'name'], 
      key: 'category',
      render: (_, record) => record.category?.name || '-'
    },
    { title: '浏览量', dataIndex: 'views', key: 'views', width: 100 },
    { 
      title: '创建时间', 
      dataIndex: 'created_at', 
      key: 'created_at',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定要删除吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>知识点管理</h2>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>导出Excel</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增知识点
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: setPage,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <Modal
        title={editingItem ? '编辑知识点' : '新增知识点'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item name="category_id" label="分类" rules={[{ required: true }]}>
            <Select placeholder="请选择分类">
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}>
            <Input.TextArea rows={8} placeholder="请输入内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default KnowledgeManage;
