import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Select, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { visitApi, userApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const VisitRecordPage = () => {
  const [list, setList] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const { isAdmin, isDoctor } = useAuth();

  const canEdit = isAdmin() || isDoctor();

  const fetchList = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const result = await visitApi.list({ page, page_size: pageSize });
      setList(result.list || []);
      setPagination({
        current: result.page || 1,
        pageSize: result.pageSize || 10,
        total: result.total || 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (canEdit) {
      const result = await userApi.list({ page: 1, page_size: 1000 });
      setUsers(result.list || []);
    }
  };

  useEffect(() => {
    fetchList();
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ visit_date: dayjs() });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      user_id: record.user_id,
      visit_date: record.visit_date ? dayjs(record.visit_date) : null,
      department: record.department,
      chief_complaint: record.chief_complaint,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      prescription: record.prescription
    });
    setModalVisible(true);
  };

  const handleView = (record) => {
    setViewingRecord(record);
    setDetailVisible(true);
  };

  const handleDelete = async (id) => {
    await visitApi.delete(id);
    message.success('删除成功');
    fetchList(pagination.current, pagination.pageSize);
  };

  const handleSubmit = async (values) => {
    const data = {
      ...values,
      visit_date: values.visit_date?.toISOString()
    };

    if (editingRecord) {
      await visitApi.update(editingRecord.id, data);
      message.success('更新成功');
    } else {
      await visitApi.create(data);
      message.success('创建成功');
    }
    setModalVisible(false);
    fetchList(pagination.current, pagination.pageSize);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '患者',
      dataIndex: 'user',
      key: 'user',
      render: (user) => user?.real_name || user?.username
    },
    {
      title: '医生',
      dataIndex: 'doctor',
      key: 'doctor',
      render: (doctor) => doctor?.real_name || doctor?.username
    },
    { title: '就诊日期', dataIndex: 'visit_date', key: 'visit_date' },
    { title: '科室', dataIndex: 'department', key: 'department' },
    { title: '主诉', dataIndex: 'chief_complaint', key: 'chief_complaint', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          {canEdit && (
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
              编辑
            </Button>
          )}
          {isAdmin() && (
            <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <h2>就诊记录</h2>
      {canEdit && (
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加就诊记录
          </Button>
        </div>
      )}
      <Table
        columns={columns}
        dataSource={list}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: fetchList
        }}
      />
      <Modal
        title={editingRecord ? '编辑就诊记录' : '添加就诊记录'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="user_id"
            label="患者"
            rules={[{ required: true, message: '请选择患者' }]}
          >
            <Select
              placeholder="请选择患者"
              options={users.map(u => ({ value: u.id, label: u.real_name || u.username }))}
            />
          </Form.Item>
          <Form.Item
            name="visit_date"
            label="就诊日期"
            rules={[{ required: true, message: '请选择就诊日期' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="department" label="科室">
            <Input placeholder="如：内科、外科、全科等" />
          </Form.Item>
          <Form.Item name="chief_complaint" label="主诉">
            <Input.TextArea rows={3} placeholder="患者自述的主要症状" />
          </Form.Item>
          <Form.Item name="diagnosis" label="诊断">
            <Input.TextArea rows={3} placeholder="医生的诊断结果" />
          </Form.Item>
          <Form.Item name="treatment" label="治疗方案">
            <Input.TextArea rows={3} placeholder="治疗措施和建议" />
          </Form.Item>
          <Form.Item name="prescription" label="处方">
            <Input.TextArea rows={3} placeholder="开具的药物和用法用量" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="就诊记录详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {viewingRecord && (
          <div style={{ lineHeight: 2 }}>
            <p><strong>患者：</strong>{viewingRecord.user?.real_name || viewingRecord.user?.username}</p>
            <p><strong>医生：</strong>{viewingRecord.doctor?.real_name || viewingRecord.doctor?.username}</p>
            <p><strong>就诊日期：</strong>{viewingRecord.visit_date}</p>
            <p><strong>科室：</strong>{viewingRecord.department || '-'}</p>
            <p><strong>主诉：</strong>{viewingRecord.chief_complaint || '-'}</p>
            <p><strong>诊断：</strong>{viewingRecord.diagnosis || '-'}</p>
            <p><strong>治疗方案：</strong>{viewingRecord.treatment || '-'}</p>
            <p><strong>处方：</strong>{viewingRecord.prescription || '-'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VisitRecordPage;
