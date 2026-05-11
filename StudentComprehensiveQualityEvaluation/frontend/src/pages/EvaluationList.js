import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Input, Modal, message, Popconfirm, Space, Select, InputNumber, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../utils/request';
import dayjs from 'dayjs';

const { Option } = Select;

function EvaluationList() {
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const loadData = async (page = 1, pageSize = 10, searchParams = {}) => {
    setLoading(true);
    try {
      const params = { page, pageSize, ...searchParams };
      const res = await api.get('/evaluations', { params });
      setData(res.data.list || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Load evaluations error:', error);
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
      await api.delete(`/evaluations/${id}`);
      message.success('删除成功');
      loadData(pagination.current, pagination.pageSize, form.getFieldsValue());
    } catch (error) {
      console.error('Delete evaluation error:', error);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      if (values.academic_score && values.moral_score && values.ability_score) {
        values.total_score = values.academic_score + values.moral_score + values.ability_score;
      }
      if (editingRecord) {
        await api.put(`/evaluations/${editingRecord.id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/evaluations', values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData(pagination.current, pagination.pageSize, form.getFieldsValue());
    } catch (error) {
      console.error('Save evaluation error:', error);
    }
  };

  const levelColors = {
    优秀: 'gold',
    良好: 'green',
    中等: 'blue',
    及格: 'orange',
    不及格: 'red',
  };

  const statusColors = {
    draft: 'default',
    submitted: 'blue',
    approved: 'green',
  };

  const statusTexts = {
    draft: '草稿',
    submitted: '已提交',
    approved: '已审核',
  };

  const columns = [
    { title: '学号', dataIndex: 'student_no', key: 'student_no' },
    { title: '学生姓名', dataIndex: 'student_name', key: 'student_name' },
    { title: '学期', dataIndex: 'semester', key: 'semester' },
    { title: '学业成绩', dataIndex: 'academic_score', key: 'academic_score' },
    { title: '思想品德', dataIndex: 'moral_score', key: 'moral_score' },
    { title: '能力加分', dataIndex: 'ability_score', key: 'ability_score' },
    {
      title: '总分',
      dataIndex: 'total_score',
      key: 'total_score',
      render: (score) => <span style={{ fontWeight: 'bold', color: score >= 85 ? 'green' : score >= 60 ? 'blue' : 'red' }}>{score}</span>,
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      render: (level) => level ? <Tag color={levelColors[level] || 'default'}>{level}</Tag> : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusColors[status] || 'default'}>{statusTexts[status] || status}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
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
  ];

  return (
    <div>
      <h2 className="page-title">综合素质测评管理</h2>

      <Form form={form} layout="inline" className="search-form">
        <Form.Item name="student_no" label="学号">
          <Input placeholder="请输入学号" />
        </Form.Item>
        <Form.Item name="student_name" label="姓名">
          <Input placeholder="请输入姓名" />
        </Form.Item>
        <Form.Item name="semester" label="学期">
          <Select placeholder="请选择学期" allowClear style={{ width: 200 }}>
            <Option value="2023-2024学年第一学期">2023-2024学年第一学期</Option>
            <Option value="2023-2024学年第二学期">2023-2024学年第二学期</Option>
            <Option value="2024-2025学年第一学期">2024-2025学年第一学期</Option>
            <Option value="2024-2025学年第二学期">2024-2025学年第二学期</Option>
          </Select>
        </Form.Item>
        <Form.Item name="level" label="等级">
          <Select placeholder="请选择等级" allowClear style={{ width: 120 }}>
            <Option value="优秀">优秀</Option>
            <Option value="良好">良好</Option>
            <Option value="中等">中等</Option>
            <Option value="及格">及格</Option>
            <Option value="不及格">不及格</Option>
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

      <div className="table-toolbar">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增测评
        </Button>
      </div>

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
        title={editingRecord ? '编辑测评' : '新增测评'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={modalForm} layout="vertical">
          <Form.Item name="student_id" label="学生ID" rules={[{ required: true, message: '请输入学生ID' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="student_no" label="学号" rules={[{ required: true, message: '请输入学号' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="student_name" label="学生姓名" rules={[{ required: true, message: '请输入学生姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="semester" label="学期" rules={[{ required: true, message: '请选择学期' }]}>
            <Select>
              <Option value="2023-2024学年第一学期">2023-2024学年第一学期</Option>
              <Option value="2023-2024学年第二学期">2023-2024学年第二学期</Option>
              <Option value="2024-2025学年第一学期">2024-2025学年第一学期</Option>
              <Option value="2024-2025学年第二学期">2024-2025学年第二学期</Option>
            </Select>
          </Form.Item>
          <Form.Item label="分数">
            <Space>
              <Form.Item name="academic_score" label="学业成绩" noStyle rules={[{ required: true }]}>
                <InputNumber min={0} max={100} placeholder="学业成绩" />
              </Form.Item>
              <Form.Item name="moral_score" label="思想品德" noStyle rules={[{ required: true }]}>
                <InputNumber min={0} max={100} placeholder="思想品德" />
              </Form.Item>
              <Form.Item name="ability_score" label="能力加分" noStyle rules={[{ required: true }]}>
                <InputNumber min={0} max={100} placeholder="能力加分" />
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item name="level" label="等级">
            <Select>
              <Option value="优秀">优秀</Option>
              <Option value="良好">良好</Option>
              <Option value="中等">中等</Option>
              <Option value="及格">及格</Option>
              <Option value="不及格">不及格</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select defaultValue="draft">
              <Option value="draft">草稿</Option>
              <Option value="submitted">已提交</Option>
              <Option value="approved">已审核</Option>
            </Select>
          </Form.Item>
          <Form.Item name="comment" label="评语">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default EvaluationList;
