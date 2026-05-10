import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Select, DatePicker, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { appointmentApi, userApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const AppointmentPage = () => {
  const [list, setList] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const { isAdmin, isDoctor, isPatient } = useAuth();

  const canEdit = true;

  const statusMap = {
    pending: { color: 'orange', text: '待处理' },
    confirmed: { color: 'green', text: '已确认' },
    cancelled: { color: 'red', text: '已取消' },
    completed: { color: 'blue', text: '已完成' }
  };

  const fetchList = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const result = await appointmentApi.list({ page, page_size: pageSize });
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

  const fetchDoctors = async () => {
    const result = await userApi.getDoctors();
    setDoctors(result || []);
  };

  useEffect(() => {
    fetchList();
    fetchDoctors();
  }, []);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      doctor_id: record.doctor_id,
      appointment_time: record.appointment_time ? dayjs(record.appointment_time) : null,
      location: record.location,
      reason: record.reason,
      status: record.status
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    await appointmentApi.delete(id);
    message.success('删除成功');
    fetchList(pagination.current, pagination.pageSize);
  };

  const handleSubmit = async (values) => {
    const data = {
      ...values,
      appointment_time: values.appointment_time?.toISOString()
    };

    if (editingRecord) {
      await appointmentApi.update(editingRecord.id, data);
      message.success('更新成功');
    } else {
      await appointmentApi.create(data);
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
    { title: '预约时间', dataIndex: 'appointment_time', key: 'appointment_time' },
    { title: '地点', dataIndex: 'location', key: 'location' },
    { title: '预约原因', dataIndex: 'reason', key: 'reason' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const info = statusMap[status] || { color: 'default', text: status };
        return <Tag color={info.color}>{info.text}</Tag>;
      }
    },
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
      <h2>预约管理</h2>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加预约
        </Button>
      </div>
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
        title={editingRecord ? '编辑预约' : '添加预约'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="doctor_id"
            label="医生"
            rules={[{ required: true, message: '请选择医生' }]}
          >
            <Select
              placeholder="请选择医生"
              options={doctors.map(d => ({ value: d.id, label: d.real_name || d.username }))}
            />
          </Form.Item>
          <Form.Item
            name="appointment_time"
            label="预约时间"
            rules={[{ required: true, message: '请选择预约时间' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="location"
            label="地点"
            rules={[{ required: true, message: '请输入地点' }]}
          >
            <Input placeholder="如：社区卫生服务中心三楼302室" />
          </Form.Item>
          <Form.Item
            name="reason"
            label="预约原因"
            rules={[{ required: true, message: '请输入预约原因' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          {!isPatient() && (
            <Form.Item name="status" label="状态">
              <Select
                placeholder="请选择状态"
                options={[
                  { value: 'pending', label: '待处理' },
                  { value: 'confirmed', label: '已确认' },
                  { value: 'cancelled', label: '已取消' },
                  { value: 'completed', label: '已完成' }
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default AppointmentPage;
