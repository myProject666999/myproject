import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, InputNumber, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { userApi, roleApi } from '../../utils/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchUsers = async (page = 1, pageSize = 10, keyword = '') => {
    setLoading(true);
    try {
      const result = await userApi.list({ page, page_size: pageSize, keyword });
      setUsers(result.list || []);
      setPagination({
        current: result.page || 1,
        pageSize: result.pageSize || 10,
        total: result.total || 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    const result = await roleApi.list();
    setRoles(result || []);
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      username: record.username,
      real_name: record.real_name,
      phone: record.phone,
      email: record.email,
      status: record.status,
      roles: record.roles?.map(r => r.id) || []
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    await userApi.delete(id);
    message.success('删除成功');
    fetchUsers(pagination.current, pagination.pageSize, searchKeyword);
  };

  const handleSubmit = async (values) => {
    if (editingUser) {
      await userApi.update(editingUser.id, values);
      message.success('更新成功');
    } else {
      await userApi.create(values);
      message.success('创建成功');
    }
    setModalVisible(false);
    fetchUsers(pagination.current, pagination.pageSize, searchKeyword);
  };

  const handleSearch = () => {
    fetchUsers(1, pagination.pageSize, searchKeyword);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '真实姓名', dataIndex: 'real_name', key: 'real_name' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles) => roles?.map(r => r.display_name || r.name).join(', ')
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => status === 1 ? '启用' : '禁用'
    },
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
      <h2>用户管理</h2>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input
          placeholder="搜索用户名/姓名/手机号"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 300 }}
        />
        <Button type="primary" onClick={handleSearch}>搜索</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加用户
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => fetchUsers(page, pageSize, searchKeyword)
        }}
      />
      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {!editingUser && (
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input />
            </Form.Item>
          )}
          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          {editingUser && (
            <Form.Item
              name="password"
              label="密码（留空不修改）"
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="real_name" label="真实姓名">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item
            name="roles"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择角色"
              options={roles.map(r => ({ value: r.id, label: r.display_name || r.name }))}
            />
          </Form.Item>
          {editingUser && (
            <Form.Item name="status" label="状态">
              <Select
                options={[
                  { value: 1, label: '启用' },
                  { value: 0, label: '禁用' }
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
