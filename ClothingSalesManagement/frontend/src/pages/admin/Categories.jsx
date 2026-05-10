import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, InputNumber, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { adminApi } from '../../api';

const { Option } = Select;

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCategories();
      setCategories(res.data || []);
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCat(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (cat) => {
    setEditingCat(cat);
    form.setFieldsValue(cat);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteCategory(id);
      message.success('删除成功');
      loadCategories();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingCat) {
        await adminApi.updateCategory(editingCat.id, values);
        message.success('更新成功');
      } else {
        await adminApi.createCategory(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadCategories();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '分类名称', dataIndex: 'name' },
    {
      title: '上级分类',
      dataIndex: 'parent_id',
      render: (parentId) => {
        if (!parentId) return '-';
        const parent = categories.find((c) => c.id === parentId);
        return parent?.name || '-';
      },
    },
    { title: '排序', dataIndex: 'sort_order' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (s) => (s === 1 ? '启用' : '禁用'),
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加分类
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={categories}
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingCat ? '编辑分类' : '添加分类'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="分类名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="parent_id" label="上级分类">
            <Select allowClear placeholder="请选择（不选则为一级分类）">
              {categories
                .filter((c) => !editingCat || c.id !== editingCat.id)
                .map((cat) => (
                  <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item name="sort_order" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingCat ? '保存' : '创建'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
