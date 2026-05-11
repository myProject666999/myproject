import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  message, 
  Popconfirm,
  Space,
  Card
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const Hospitals = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '医院名称', dataIndex: 'name', key: 'name' },
    { title: '地址', dataIndex: 'address', key: 'address' },
    { title: '等级', dataIndex: 'level', key: 'level' },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    { title: '院长', dataIndex: 'director', key: 'director' },
    { title: '容量', dataIndex: 'capacity', key: 'capacity' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (val) => val === 1 ? '启用' : '禁用'
    },
    {
      title: '操作',
      key: 'action',
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

  const loadData = async (params = {}) => {
    setLoading(true);
    try {
      const res = await request.get('/admin/hospitals', { 
        params: { 
          page: pagination.current, 
          page_size: pagination.pageSize,
          ...params 
        } 
      });
      setData(res.data.list);
      setPagination(prev => ({ ...prev, total: res.data.total }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [pagination.current, pagination.pageSize]);

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
      await request.delete(`/admin/hospitals/${id}`);
      message.success('删除成功');
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await request.put(`/admin/hospitals/${editingItem.id}`, values);
        message.success('更新成功');
      } else {
        await request.post('/admin/hospitals', values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (values) => {
    setPagination(prev => ({ ...prev, current: 1 }));
    loadData(values);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
    loadData();
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Form 
            form={searchForm} 
            layout="inline" 
            onFinish={handleSearch}
            style={{ marginBottom: 16 }}
          >
            <Form.Item name="name" label="医院名称">
              <Input placeholder="请输入医院名称" />
            </Form.Item>
            <Form.Item name="level" label="医院等级">
              <Select placeholder="请选择等级" style={{ width: 120 }} allowClear>
                <Select.Option value="三级甲等">三级甲等</Select.Option>
                <Select.Option value="三级乙等">三级乙等</Select.Option>
                <Select.Option value="二级甲等">二级甲等</Select.Option>
                <Select.Option value="二级乙等">二级乙等</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select placeholder="请选择状态" style={{ width: 100 }} allowClear>
                <Select.Option value="1">启用</Select.Option>
                <Select.Option value="0">禁用</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>搜索</Button>
                <Button onClick={handleReset}>重置</Button>
              </Space>
            </Form.Item>
          </Form>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加医院
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑医院' : '添加医院'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="医院名称" rules={[{ required: true, message: '请输入医院名称' }]}>
            <Input placeholder="请输入医院名称" />
          </Form.Item>
          <Form.Item name="address" label="地址" rules={[{ required: true, message: '请输入地址' }]}>
            <Input placeholder="请输入地址" />
          </Form.Item>
          <Form.Item name="level" label="医院等级" rules={[{ required: true, message: '请选择等级' }]}>
            <Select placeholder="请选择等级">
              <Select.Option value="三级甲等">三级甲等</Select.Option>
              <Select.Option value="三级乙等">三级乙等</Select.Option>
              <Select.Option value="二级甲等">二级甲等</Select.Option>
              <Select.Option value="二级乙等">二级乙等</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="director" label="院长">
            <Input placeholder="请输入院长姓名" />
          </Form.Item>
          <Form.Item name="capacity" label="容量">
            <InputNumber style={{ width: '100%' }} placeholder="请输入容量" min={0} />
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

export default Hospitals;
