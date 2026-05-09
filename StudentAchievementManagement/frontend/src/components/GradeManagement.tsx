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
import { gradeApi, studentApi, courseApi } from '../services/api';
import type { Grade, Student, Course } from '../types';

const GradeManagement: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchForm] = Form.useForm();
  const [form] = Form.useForm();

  const fetchGrades = async (params?: { studentNo?: string; courseNo?: string }) => {
    setLoading(true);
    try {
      const response = await gradeApi.getAll(params);
      setGrades(response.data.data);
    } catch (error) {
      message.error('获取成绩列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentApi.getAll();
      setStudents(response.data.data);
    } catch (error) {
      message.error('获取学生列表失败');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await courseApi.getAll();
      setCourses(response.data.data);
    } catch (error) {
      message.error('获取课程列表失败');
    }
  };

  useEffect(() => {
    fetchGrades();
    fetchStudents();
    fetchCourses();
  }, []);

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    fetchGrades(values);
  };

  const handleReset = () => {
    searchForm.resetFields();
    fetchGrades();
  };

  const handleAdd = () => {
    setEditingGrade(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Grade) => {
    setEditingGrade(record);
    form.setFieldsValue({
      ...record,
      examDate: record.examDate ? dayjs(record.examDate) : null,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await gradeApi.delete(id);
      message.success('删除成功');
      fetchGrades();
      setSelectedRowKeys((prev) => prev.filter((key) => key !== id));
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的成绩');
      return;
    }
    try {
      await gradeApi.batchDelete(selectedRowKeys as number[]);
      message.success(`成功删除 ${selectedRowKeys.length} 条记录`);
      fetchGrades();
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
        examDate: values.examDate ? values.examDate.format('YYYY-MM-DD') : '',
      };

      if (editingGrade && editingGrade.id) {
        await gradeApi.update(editingGrade.id, submitData);
        message.success('更新成功');
      } else {
        await gradeApi.create(submitData);
        message.success('添加成功');
      }
      setIsModalOpen(false);
      fetchGrades();
    } catch (error) {
      message.error(editingGrade ? '更新失败' : '添加失败');
    }
  };

  const getStudentName = (studentNo: string) => {
    const student = students.find((s) => s.studentNo === studentNo);
    return student ? student.name : '';
  };

  const getCourseName = (courseNo: string) => {
    const course = courses.find((c) => c.courseNo === courseNo);
    return course ? course.name : '';
  };

  const columns: ColumnsType<Grade> = [
    { title: '学号', dataIndex: 'studentNo', key: 'studentNo' },
    {
      title: '学生姓名',
      key: 'studentName',
      render: (_, record) => getStudentName(record.studentNo),
    },
    { title: '课程号', dataIndex: 'courseNo', key: 'courseNo' },
    {
      title: '课程名',
      key: 'courseName',
      render: (_, record) => getCourseName(record.courseNo),
    },
    { title: '成绩', dataIndex: 'score', key: 'score' },
    { title: '考试日期', dataIndex: 'examDate', key: 'examDate' },
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
            title="确定要删除这个成绩吗？"
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
        <Form.Item name="studentNo" label="学号">
          <Input placeholder="请输入学号搜索" allowClear />
        </Form.Item>
        <Form.Item name="courseNo" label="课程号">
          <Input placeholder="请输入课程号" allowClear />
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
            添加成绩
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
        dataSource={grades}
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
      />

      <Modal
        title={editingGrade ? '编辑成绩' : '添加成绩'}
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
            name="courseNo"
            label="课程号"
            rules={[{ required: true, message: '请输入课程号' }]}
          >
            <Input placeholder="请输入课程号" />
          </Form.Item>
          <Form.Item
            name="score"
            label="成绩"
            rules={[{ required: true, message: '请输入成绩' }]}
          >
            <InputNumber
              min={0}
              max={100}
              step={0.5}
              style={{ width: '100%' }}
              placeholder="请输入成绩"
            />
          </Form.Item>
          <Form.Item name="examDate" label="考试日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GradeManagement;
