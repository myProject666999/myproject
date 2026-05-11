import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  message, 
  Popconfirm,
  Space,
  Card
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const Activities = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '活动标题', dataIndex: 'title', key: 'title' },
    { title: '地点', dataIndex: 'location', key: 'location' },
    { title: '开始日期', dataIndex: 'start_date', key: 'start_date' },
    { title: '结束日期', dataIndex: 'end_date', key: 'end_date' },
    { title: '主办方', dataIndex: 'organizer', key: 'organizer' },
    { title: '参与人数', key: 'participants', render: (_, record) => `${record.current_participants}/${record.max_participants}` },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (val) => val === 1 ? '进行中' : '已结束'
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
      const res = await request.get('/admin/activities', { 
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
      await request.delete(`/admin/activities/${id}`);
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
        await request.put(`/admin/activities/${editingItem.id}`, values);
        message.success('更新成功');
      } else {
        await request.post('/admin/activities', values);
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
            <Form.Item name="title" label="活动标题">
              <Input placeholder="请输入活动标题（模糊查询）" style={{ width: 200 }} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>搜索</Button>
                <Button onClick={handleReset}>重置</Button>
              </Space>
            </Form.Item>
          </Form>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加活动
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
        title={editingItem ? '编辑活动' : '添加活动'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="活动标题" rules={[{ required: true, message: '请输入活动标题' }]}>
            <Input placeholder="请输入活动标题" />
          </Form.Item>
          <Form.Item name="description" label="活动描述">
            <Input.TextArea placeholder="请输入活动描述" rows={3} />
          </Form.Item>
          <Form.Item name="location" label="活动地点" rules={[{ required: true, message: '请输入活动地点' }]}>
            <Input placeholder="请输入活动地点" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="start_date" label="开始日期" style={{ flex: 1 }}>
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="end_date" label="结束日期" style={{ flex: 1 }}>
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
          </div>
          <Form.Item name="organizer" label="主办方">
            <Input placeholder="请输入主办方" />
          </Form.Item>
          <Form.Item name="max_participants" label="最大参与人数">
            <InputNumber style={{ width: '100%' }} placeholder="请输入最大参与人数" min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Activities;
