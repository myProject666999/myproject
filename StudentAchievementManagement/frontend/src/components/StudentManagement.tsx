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
  Select,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { studentApi } from '../services/api';
import type { Student } from '../types';

const { Option } = Select;

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchForm] = Form.useForm();
  const [form] = Form.useForm();

  const fetchStudents = async (params?: { studentNo?: string; name?: string }) => {
    setLoading(true);
    try {
      const response = await studentApi.getAll(params);
      setStudents(response.data.data);
    } catch (error) {
      message.error('获取学生列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    fetchStudents(values);
  };

  const handleReset = () => {
    searchForm.resetFields();
    fetchStudents();
  };

  const handleAdd = () => {
    setEditingStudent(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Student) => {
    setEditingStudent(record);
    form.setFieldsValue({
      ...record,
      birthDate: record.birthDate ? dayjs(record.birthDate) : null,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await studentApi.delete(id);
      message.success('删除成功');
      fetchStudents();
      setSelectedRowKeys((prev) => prev.filter((key) => key !== id));
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的学生');
      return;
    }
    try {
      await studentApi.batchDelete(selectedRowKeys as number[]);
      message.success(`成功删除 ${selectedRowKeys.length} 条记录`);
      fetchStudents();
      setSelectedRowKeys([]);
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        ...values,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : '',
      };

      if (editingStudent && editingStudent.id) {
        await studentApi.update(editingStudent.id, submitData);
        message.success('更新成功');
      } else {
        await studentApi.create(submitData);
        message.success('添加成功');
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (error) {
      message.error(editingStudent ? '更新失败' : '添加失败');
    }
  };

  const columns: ColumnsType<Student> = [
    { title: '学号', dataIndex: 'studentNo', key: 'studentNo' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '性别', dataIndex: 'gender', key: 'gender' },
    { title: '出生日期', dataIndex: 'birthDate', key: 'birthDate' },
    { title: '专业', dataIndex: 'major', key: 'major' },
    { title: '班级', dataIndex: 'class', key: 'class' },
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
            title="确定要删除这个学生吗？"
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
      <Form
        form={searchForm}
        layout="inline"
        style={{ marginBottom: 16 }}
      >
        <Form.Item name="studentNo" label="学号">
          <Input placeholder="请输入学号" allowClear />
        </Form.Item>
        <Form.Item name="name" label="姓名">
          <Input placeholder="请输入姓名" allowClear />
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
            添加学生
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
        dataSource={students}
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
      />

      <Modal
        title={editingStudent ? '编辑学生' : '添加学生'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="studentNo"
            label="学号"
            rules={[{ required: true, message: '请输入学号' }]}
          >
            <Input placeholder="请输入学号" />
          </Form.Item>
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Select placeholder="请选择性别">
              <Option value="男">男</Option>
              <Option value="女">女</Option>
            </Select>
          </Form.Item>
          <Form.Item name="birthDate" label="出生日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="major" label="专业">
            <Input placeholder="请输入专业" />
          </Form.Item>
          <Form.Item name="class" label="班级">
            <Input placeholder="请输入班级" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentManagement;
