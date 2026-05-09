import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Switch, Typography, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { advocateAPI } from '../../services/api';

const { Title } = Typography;

function Advocates() {
  const [activeTab, setActiveTab] = useState('list');
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCat, setEditingCat] = useState(null);
  const [form] = Form.useForm();
  const [catForm] = Form.useForm();

  useEffect(() => {
    loadList();
    loadCategories();
  }, [page]);

  const loadList = async () => {
    try {
      const res = await advocateAPI.getAdminList({ page, page_size: 10 });
      setList(res.data.data?.list || []);
      setTotal(res.data.data?.total || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await advocateAPI.getAdminCategories();
      setCategories(res.data.data || []);
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
      form.setFieldsValue({ status: 1 });
    }
    setModalOpen(true);
  };

  const openCatModal = (item = null) => {
    setEditingCat(item);
    if (item) {
      catForm.setFieldsValue(item);
    } else {
      catForm.resetFields();
    }
    setCatModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        await advocateAPI.update(editingItem.id, values);
        message.success('更新成功');
      } else {
        await advocateAPI.create(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      loadList();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleCatSubmit = async (values) => {
    try {
      if (editingCat) {
        await advocateAPI.updateCategory(editingCat.id, values);
        message.success('更新成功');
      } else {
        await advocateAPI.createCategory(values);
        message.success('创建成功');
      }
      setCatModalOpen(false);
      loadCategories();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await advocateAPI.delete(id);
      message.success('删除成功');
      loadList();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleCatDelete = async (id) => {
    try {
      await advocateAPI.deleteCategory(id);
      message.success('删除成功');
      loadCategories();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const listColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '分类', dataIndex: ['category', 'name'], key: 'category' },
    { title: '浏览量', dataIndex: 'views', key: 'views' },
    { title: '状态', dataIndex: 'status', key: 'status', render: v => v === 1 ? '上架' : '下架' },
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

  const catColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '排序', dataIndex: 'sort', key: 'sort' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openCatModal(record)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleCatDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>📚 文明倡导管理</Title>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'list',
            label: '倡导列表',
            children: (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>新增倡导</Button>
                </div>
                <Table
                  columns={listColumns}
                  dataSource={list}
                  rowKey="id"
                  pagination={{ current: page, total, pageSize: 10, onChange: setPage }}
                />
              </>
            )
          },
          {
            key: 'categories',
            label: '分类管理',
            children: (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => openCatModal()}>新增分类</Button>
                </div>
                <Table
                  columns={catColumns}
                  dataSource={categories}
                  rowKey="id"
                  pagination={false}
                />
              </>
            )
          }
        ]}
      />

      <Modal title={editingItem ? '编辑倡导' : '新增倡导'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={700}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="category_id" label="分类" rules={[{ required: true }]}>
            <Select>
              {categories.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}><Input.TextArea rows={6} /></Form.Item>
          <Form.Item name="thumbnail" label="缩略图URL"><Input /></Form.Item>
          <Form.Item name="video_url" label="视频URL"><Input /></Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch checkedChildren="上架" unCheckedChildren="下架" />
          </Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" block>提交</Button></Form.Item>
        </Form>
      </Modal>

      <Modal title={editingCat ? '编辑分类' : '新增分类'} open={catModalOpen} onCancel={() => setCatModalOpen(false)} footer={null}>
        <Form form={catForm} layout="vertical" onFinish={handleCatSubmit}>
          <Form.Item name="name" label="分类名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="sort" label="排序"><Input.Number style={{ width: '100%' }} /></Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" block>提交</Button></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Advocates;
