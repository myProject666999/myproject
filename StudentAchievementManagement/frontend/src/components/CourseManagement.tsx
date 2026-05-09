import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  message,
  Popconfirm,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { courseApi } from '../services/api';
import type { Course } from '../types';

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchForm] = Form.useForm();
  const [form] = Form.useForm();

  const fetchCourses = async (params?: { courseNo?: string; name?: string }) => {
    setLoading(true);
    try {
      const response = await courseApi.getAll(params);
      setCourses(response.data.data);
    } catch (error) {
      message.error('获取课程列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    fetchCourses(values);
  };

  const handleReset = () => {
    searchForm.resetFields();
    fetchCourses();
  };

  const handleAdd = () => {
    setEditingCourse(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Course) => {
    setEditingCourse(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await courseApi.delete(id);
      message.success('删除成功');
      fetchCourses();
      setSelectedRowKeys((prev) => prev.filter((key) => key !== id));
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的课程');
      return;
    }
    try {
      await courseApi.batchDelete(selectedRowKeys as number[]);
      message.success(`成功删除 ${selectedRowKeys.length} 条记录`);
      fetchCourses();
      setSelectedRowKeys([]);
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingCourse && editingCourse.id) {
        await courseApi.update(editingCourse.id, values);
        message.success('更新成功');
      } else {
        await courseApi.create(values);
        message.success('添加成功');
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (error) {
      message.error(editingCourse ? '更新失败' : '添加失败');
    }
  };

  const columns: ColumnsType<Course> = [
    { title: '课程号', dataIndex: 'courseNo', key: 'courseNo' },
    { title: '课程名', dataIndex: 'name', key: 'name' },
    { title: '授课教师', dataIndex: 'teacher', key: 'teacher' },
    { title: '学分', dataIndex: 'credits', key: 'credits' },
    { title: '学时', dataIndex: 'hours', key: 'hours' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个课程吗？"
            onConfirm={() => record.id && handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Form form={searchForm} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="courseNo" label="课程号">
          <Input placeholder="请输入课程号" allowClear />
        </Form.Item>
        <Form.Item name="name" label="课程名">
          <Input placeholder="请输入课程名" allowClear />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加课程
          </Button>
          <Popconfirm
            title={`确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`}
            onConfirm={handleBatchDelete}
            okText="确定"
            cancelText="取消"
            disabled={selectedRowKeys.length === 0}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={selectedRowKeys.length === 0}
            >
              批量删除
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={courses}
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
      />

      <Modal
        title={editingCourse ? '编辑课程' : '添加课程'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="courseNo"
            label="课程号"
            rules={[{ required: true, message: '请输入课程号' }]}
          >
            <Input placeholder="请输入课程号" />
          </Form.Item>
          <Form.Item
            name="name"
            label="课程名"
            rules={[{ required: true, message: '请输入课程名' }]}
          >
            <Input placeholder="请输入课程名" />
          </Form.Item>
          <Form.Item name="teacher" label="授课教师">
            <Input placeholder="请输入授课教师" />
          </Form.Item>
          <Form.Item
            name="credits"
            label="学分"
            rules={[{ required: true, message: '请输入学分' }]}
          >
            <InputNumber
              min={0}
              max={10}
              step={0.5}
              style={{ width: '100%' }}
              placeholder="请输入学分"
            />
          </Form.Item>
          <Form.Item name="hours" label="学时">
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="请输入学时"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseManagement;
