import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Select, InputNumber, Tag, Drawer, List } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, CommentOutlined } from '@ant-design/icons';
import request from '../../utils/request';

function CoursesManage() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [commentDrawerVisible, setCommentDrawerVisible] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [comments, setComments] = useState([]);
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
      const res = await request.get(`/admin/courses?page=${page}&page_size=${pageSize}`);
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
      const res = await request.delete(`/admin/courses/${id}`);
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
        await request.put(`/admin/courses/${editingItem.id}`, values);
        message.success('更新成功');
      } else {
        await request.post('/admin/courses', values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleViewComments = async (record) => {
    setCurrentCourse(record);
    try {
      const res = await request.get(`/admin/courses/${record.id}/comments`);
      setComments(res.data || []);
      setCommentDrawerVisible(true);
    } catch (error) {
      message.error('加载评论失败');
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      const res = await request.delete(`/admin/comments/${id}`);
      if (res.code === 200) {
        message.success('删除成功');
        if (currentCourse) {
          handleViewComments(currentCourse);
        }
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:8080/api/admin/courses/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '课程.xlsx';
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
    { title: '课程名称', dataIndex: 'title', key: 'title' },
    { title: '讲师', dataIndex: 'teacher', key: 'teacher' },
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
          <Button type="link" icon={<CommentOutlined />} onClick={() => handleViewComments(record)}>评论</Button>
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
        <h2 style={{ margin: 0 }}>课程管理</h2>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>导出Excel</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增课程
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
        title={editingItem ? '编辑课程' : '新增课程'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="课程名称" rules={[{ required: true }]}>
            <Input placeholder="请输入课程名称" />
          </Form.Item>
          <Form.Item name="teacher" label="讲师" rules={[{ required: true }]}>
            <Input placeholder="请输入讲师" />
          </Form.Item>
          <Form.Item name="category_id" label="分类" rules={[{ required: true }]}>
            <Select placeholder="请选择分类">
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="cover" label="封面图片URL">
            <Input placeholder="请输入封面图片URL" />
          </Form.Item>
          <Form.Item name="description" label="简介">
            <Input.TextArea rows={4} placeholder="请输入简介" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`${currentCourse?.title} - 评论列表`}
        placement="right"
        onClose={() => setCommentDrawerVisible(false)}
        open={commentDrawerVisible}
        width={500}
      >
        {comments.length > 0 ? (
          <List
            dataSource={comments}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Popconfirm title="确定删除这条评论吗？" onConfirm={() => handleDeleteComment(item.id)}>
                    <Button type="link" danger>删除</Button>
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  avatar={<Tag color="blue">{item.user?.nickname || item.user?.username}</Tag>}
                  title={new Date(item.created_at).toLocaleString()}
                  description={item.content}
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>暂无评论</div>
        )}
      </Drawer>
    </div>
  );
}

export default CoursesManage;
