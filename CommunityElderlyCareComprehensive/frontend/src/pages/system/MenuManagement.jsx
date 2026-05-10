import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Select, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { menuApi } from '../../utils/api';

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [form] = Form.useForm();

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const result = await menuApi.list();
      setMenus(result || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleAdd = (parentId = 0) => {
    setEditingMenu(null);
    form.resetFields();
    form.setFieldsValue({ parent_id: parentId });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingMenu(record);
    form.setFieldsValue({
      parent_id: record.parent_id,
      name: record.name,
      path: record.path,
      icon: record.icon,
      sort: record.sort
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    await menuApi.delete(id);
    message.success('删除成功');
    fetchMenus();
  };

  const handleSubmit = async (values) => {
    if (editingMenu) {
      await menuApi.update(editingMenu.id, values);
      message.success('更新成功');
    } else {
      await menuApi.create(values);
      message.success('创建成功');
    }
    setModalVisible(false);
    fetchMenus();
  };

  const parentOptions = [
    { value: 0, label: '顶级菜单' },
    ...menus.filter(m => m.parent_id === 0).map(m => ({
      value: m.id,
      label: m.name
    }))
  ];

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '路径', dataIndex: 'path', key: 'path' },
    { title: '图标', dataIndex: 'icon', key: 'icon' },
    { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
    { title: '父级ID', dataIndex: 'parent_id', key: 'parent_id', width: 80 },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.parent_id === 0 && (
            <Button type="link" icon={<PlusOutlined />} onClick={() => handleAdd(record.id)}>
              添加子菜单
            </Button>
          )}
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <h2>菜单管理</h2>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd(0)}>
          添加菜单
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={menus}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
      <Modal
        title={editingMenu ? '编辑菜单' : '添加菜单'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="parent_id"
            label="父级菜单"
          >
            <Select options={parentOptions} />
          </Form.Item>
          <Form.Item
            name="name"
            label="菜单名称"
            rules={[{ required: true, message: '请输入菜单名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="path"
            label="路径"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="icon"
            label="图标"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="sort"
            label="排序"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuManagement;
