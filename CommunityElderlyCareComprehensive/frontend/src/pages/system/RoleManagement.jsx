import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, TreeSelect, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { roleApi, menuApi } from '../../utils/api';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form] = Form.useForm();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const result = await roleApi.list();
      setRoles(result || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenus = async () => {
    const result = await menuApi.list();
    setMenus(result || []);
  };

  const buildTreeData = (menus, parentId = 0) => {
    return menus
      .filter(m => m.parent_id === parentId)
      .map(m => ({
        title: m.name,
        value: m.id,
        key: m.id,
        children: buildTreeData(menus, m.id)
      }));
  };

  useEffect(() => {
    fetchRoles();
    fetchMenus();
  }, []);

  const handleAdd = () => {
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRole(record);
    form.setFieldsValue({
      name: record.name,
      display_name: record.display_name,
      description: record.description,
      menus: record.menus?.map(m => m.id) || []
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    await roleApi.delete(id);
    message.success('删除成功');
    fetchRoles();
  };

  const handleSubmit = async (values) => {
    if (editingRole) {
      await roleApi.update(editingRole.id, values);
      message.success('更新成功');
    } else {
      await roleApi.create(values);
      message.success('创建成功');
    }
    setModalVisible(false);
    fetchRoles();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '角色名', dataIndex: 'name', key: 'name' },
    { title: '显示名称', dataIndex: 'display_name', key: 'display_name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
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
      <h2>角色管理</h2>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加角色
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={roles}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editingRole ? '编辑角色' : '添加角色'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {!editingRole && (
            <Form.Item
              name="name"
              label="角色名"
              rules={[{ required: true, message: '请输入角色名' }]}
            >
              <Input />
            </Form.Item>
          )}
          <Form.Item name="display_name" label="显示名称">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="menus" label="菜单权限">
            <TreeSelect
              treeData={buildTreeData(menus)}
              multiple
              treeCheckable
              showCheckedStrategy={TreeSelect.SHOW_PARENT}
              placeholder="请选择菜单权限"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleManagement;
