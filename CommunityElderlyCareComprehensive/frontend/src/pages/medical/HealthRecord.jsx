import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Select, DatePicker, InputNumber, Card, Statistic, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HeartOutlined, ThunderboltOutlined, SmileOutlined, FireOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { healthApi, userApi } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const HealthRecordPage = () => {
  const [list, setList] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [stats, setStats] = useState({});
  const { isAdmin, isDoctor } = useAuth();

  const canEdit = isAdmin() || isDoctor();

  const fetchList = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const result = await healthApi.list({ page, page_size: pageSize });
      setList(result.list || []);
      setPagination({
        current: result.page || 1,
        pageSize: result.pageSize || 10,
        total: result.total || 0
      });

      if (result.list && result.list.length > 0) {
        const latest = result.list[0];
        setStats({
          heartRate: latest.heart_rate,
          bloodPressure: `${latest.blood_pressure_high}/${latest.blood_pressure_low}`,
          bloodOxygen: latest.blood_oxygen,
          temperature: latest.temperature
        });
      }
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
    form.setFieldsValue({ record_time: dayjs() });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      user_id: record.user_id,
      heart_rate: record.heart_rate,
      blood_pressure_high: record.blood_pressure_high,
      blood_pressure_low: record.blood_pressure_low,
      blood_oxygen: record.blood_oxygen,
      temperature: record.temperature,
      weight: record.weight,
      height: record.height,
      remark: record.remark,
      record_time: record.record_time ? dayjs(record.record_time) : dayjs()
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    await healthApi.delete(id);
    message.success('删除成功');
    fetchList(pagination.current, pagination.pageSize);
  };

  const handleSubmit = async (values) => {
    const data = {
      ...values,
      record_time: values.record_time?.toISOString()
    };

    if (editingRecord) {
      await healthApi.update(editingRecord.id, data);
      message.success('更新成功');
    } else {
      await healthApi.create(data);
      message.success('创建成功');
    }
    setModalVisible(false);
    fetchList(pagination.current, pagination.pageSize);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '居民',
      dataIndex: 'user',
      key: 'user',
      render: (user) => user?.real_name || user?.username
    },
    { title: '心率', dataIndex: 'heart_rate', key: 'heart_rate', render: (v) => `${v} 次/分` },
    { title: '血压', dataIndex: 'blood_pressure_high', key: 'blood_pressure', render: (_, r) => `${r.blood_pressure_high}/${r.blood_pressure_low}` },
    { title: '血氧', dataIndex: 'blood_oxygen', key: 'blood_oxygen', render: (v) => `${v}%` },
    { title: '体温', dataIndex: 'temperature', key: 'temperature', render: (v) => `${v}°C` },
    { title: '体重', dataIndex: 'weight', key: 'weight', render: (v) => `${v} kg` },
    { title: '记录时间', dataIndex: 'record_time', key: 'record_time' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
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
      <h2>健康信息</h2>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="心率"
              value={stats.heartRate || '-'}
              suffix="次/分"
              prefix={<HeartOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="血压"
              value={stats.bloodPressure || '-'}
              prefix={<ThunderboltOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="血氧"
              value={stats.bloodOxygen || '-'}
              suffix="%"
              prefix={<SmileOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="体温"
              value={stats.temperature || '-'}
              suffix="°C"
              prefix={<FireOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
      </Row>
      {canEdit && (
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加健康记录
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
        title={editingRecord ? '编辑健康记录' : '添加健康记录'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {canEdit && (
            <Form.Item
              name="user_id"
              label="居民"
              rules={[{ required: true, message: '请选择居民' }]}
            >
              <Select
                placeholder="请选择居民"
                options={users.map(u => ({ value: u.id, label: u.real_name || u.username }))}
              />
            </Form.Item>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="heart_rate" label="心率">
                <InputNumber min={0} max={200} placeholder="次/分" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="blood_pressure_high" label="收缩压">
                <InputNumber min={0} max={200} placeholder="mmHg" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="blood_pressure_low" label="舒张压">
                <InputNumber min={0} max={150} placeholder="mmHg" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="blood_oxygen" label="血氧">
                <InputNumber min={0} max={100} placeholder="%" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="temperature" label="体温">
                <InputNumber min={35} max={42} step={0.1} placeholder="°C" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="weight" label="体重">
                <InputNumber min={0} step={0.1} placeholder="kg" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="height" label="身高">
            <InputNumber min={0} placeholder="cm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="record_time" label="记录时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HealthRecordPage;
