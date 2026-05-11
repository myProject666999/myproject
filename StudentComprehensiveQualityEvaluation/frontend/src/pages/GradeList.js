import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Input, Modal, message, Popconfirm, Space, Select, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../utils/request';
import dayjs from 'dayjs';

const { Option } = Select;

function GradeList() {
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));

  const loadData = async (page = 1, pageSize = 10, searchParams = {}) => {
    setLoading(true);
    try {
      const params = { page, pageSize, ...searchParams };
      const res = await api.get('/grades', { params });
      setData(res.data.list || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Load grades error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    loadData(1, pagination.pageSize, values);
    setPagination({ ...pagination, current: 1 });
  };

  const handleReset = () => {
    form.resetFields();
    loadData();
  };

  const handleAdd = () => {
    setEditingRecord(null);
    modalForm.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    modalForm.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/grades/${id}`);
      message.success('删除成功');
      loadData(pagination.current, pagination.pageSize, form.getFieldsValue());
    } catch (error) {
      console.error('Delete grade error:', error);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      if (editingRecord) {
        await api.put(`/grades/${editingRecord.id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/grades', values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData(pagination.current, pagination.pageSize, form.getFieldsValue());
    } catch (error) {
      console.error('Save grade error:', error);
    }
  };

  const isStudent = user.role === 'student';

  const columns = [
    { title: '学号', dataIndex: 'student_no', key: 'student_no' },
    { title: '学生姓名', dataIndex: 'student_name', key: 'student_name' },
    { title: '课程名称', dataIndex: 'course_name', key: 'course_name' },
    { title: '学期', dataIndex: 'semester', key: 'semester' },
    { 
      title: '成绩', 
      dataIndex: 'score', 
      key: 'score',
      render: (score) => {
        let color = 'black';
        if (score >= 90) color = 'green';
        else if (score < 60) color = 'red';
        return <span style={{ color, fontWeight: 'bold' }}>{score}</span>;
      }
    },
    { title: '学分', dataIndex: 'credit', key: 'credit' },
    { title: '考试类型', dataIndex: 'exam_type', key: 'exam_type' },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    !isStudent && {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ].filter(Boolean);

  return (
    <div>
      <h2 className="page-title">学生成绩管理</h2>

      <Form form={form} layout="inline" className="search-form">
        <Form.Item name="student_no" label="学号">
          <Input placeholder="请输入学号" />
        </Form.Item>
        <Form.Item name="student_name" label="姓名">
          <Input placeholder="请输入姓名" />
        </Form.Item>
        <Form.Item name="course_name" label="课程">
          <Input placeholder="请输入课程名称" />
        </Form.Item>
        <Form.Item name="semester" label="学期">
          <Select placeholder="请选择学期" allowClear style={{ width: 150 }}>
            <Option value="2023-2024学年第一学期">2023-2024学年第一学期</Option>
            <Option value="2023-2024学年第二学期">2023-2024学年第二学期</Option>
            <Option value="2024-2025学年第一学期">2024-2025学年第一学期</Option>
            <Option value="2024-2025学年第二学期">2024-2025学年第二学期</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      {!isStudent && (
        <div className="table-toolbar">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增成绩
          </Button>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize });
            loadData(page, pageSize, form.getFieldsValue());
          },
        }}
      />

      <Modal
        title={editingRecord ? '编辑成绩' : '新增成绩'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={modalForm} layout="vertical">
          <Form.Item name="student_id" label="学生ID" rules={[{ required: true, message: '请输入学生ID' }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="student_no" label="学号" rules={[{ required: true, message: '请输入学号' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="student_name" label="学生姓名" rules={[{ required: true, message: '请输入学生姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="course_name" label="课程名称" rules={[{ required: true, message: '请输入课程名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="semester" label="学期">
            <Select>
              <Option value="2023-2024学年第一学期">2023-2024学年第一学期</Option>
              <Option value="2023-2024学年第二学期">2023-2024学年第二学期</Option>
              <Option value="2024-2025学年第一学期">2024-2025学年第一学期</Option>
              <Option value="2024-2025学年第二学期">2024-2025学年第二学期</Option>
            </Select>
          </Form.Item>
          <Form.Item name="score" label="成绩" rules={[{ required: true, message: '请输入成绩' }]}>
            <InputNumber min={0} max={100} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="credit" label="学分">
            <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="exam_type" label="考试类型">
            <Select>
              <Option value="考试">考试</Option>
              <Option value="考查">考查</Option>
              <Option value="补考">补考</Option>
            </Select>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default GradeList;
