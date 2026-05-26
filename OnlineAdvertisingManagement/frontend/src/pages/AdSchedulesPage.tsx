import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Space, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { adScheduleApi, adSpaceApi, adMaterialApi } from '../services/api';

const { RangePicker } = DatePicker;

const AdSchedulesPage: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [adSpaces, setAdSpaces] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadList();
    loadSelectData();
  }, []);

  const loadList = async () => {
    setLoading(true);
    try {
      const res = await adScheduleApi.getAll();
      setList(res.data || []);
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const loadSelectData = async () => {
    try {
      const [spacesRes, materialsRes] = await Promise.all([
        adSpaceApi.getAll(),
        adMaterialApi.getAll(),
      ]);
      setAdSpaces(spacesRes.data || []);
      setMaterials(materialsRes.data || []);
    } catch (error) {
      console.error('加载选项数据失败:', error);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingItem(record);
    form.setFieldsValue({
      ...record,
      timeRange: [dayjs(record.startTime), dayjs(record.endTime)],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await adScheduleApi.delete(id);
      message.success('删除成功');
      loadList();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        name: values.name,
        adSpaceId: values.adSpaceId,
        materialId: values.materialId,
        startTime: values.timeRange[0].toDate(),
        endTime: values.timeRange[1].toDate(),
        priority: values.priority || 0,
        status: values.status,
      };

      if (editingItem) {
        await adScheduleApi.update(editingItem.id, data);
        message.success('更新成功');
      } else {
        await adScheduleApi.create(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadList();
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  const getConflictWarning = (record: any) => {
    const now = new Date();
    const startTime = new Date(record.startTime);
    const endTime = new Date(record.endTime);
    if (now >= startTime && now <= endTime && record.status === 1) {
      return <Tag color="green">投放中</Tag>;
    }
    if (now > endTime) {
      return <Tag color="default">已结束</Tag>;
    }
    return <Tag color="blue">待投放</Tag>;
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '排期名称', dataIndex: 'name', key: 'name' },
    {
      title: '广告位',
      dataIndex: ['adSpace', 'name'],
      key: 'adSpace',
    },
    {
      title: '素材',
      dataIndex: ['material', 'name'],
      key: 'material',
    },
    {
      title: '投放时间',
      key: 'time',
      render: (_: any, record: any) => (
        <div>
          <div>{dayjs(record.startTime).format('YYYY-MM-DD HH:mm')}</div>
          <div>至 {dayjs(record.endTime).format('YYYY-MM-DD HH:mm')}</div>
        </div>
      ),
    },
    { title: '优先级', dataIndex: 'priority', key: 'priority', width: 80 },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_: any, record: any) => (
        <Space>
          {record.status === 1 ? <Tag color="green">启用</Tag> : <Tag color="default">禁用</Tag>}
          {getConflictWarning(record)}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>投放排期</h2>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增排期
          </Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={list} rowKey="id" loading={loading} />

      <Modal
        title={editingItem ? '编辑排期' : '新增排期'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="排期名称" rules={[{ required: true }]}>
            <Input placeholder="请输入排期名称" />
          </Form.Item>
          <Form.Item name="adSpaceId" label="选择广告位" rules={[{ required: true }]}>
            <Select placeholder="请选择广告位">
              {adSpaces.map((space) => (
                <Select.Option key={space.id} value={space.id}>
                  {space.name} ({space.width}×{space.height})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="materialId" label="选择素材" rules={[{ required: true }]}>
            <Select placeholder="请选择素材">
              {materials.map((material) => (
                <Select.Option key={material.id} value={material.id}>
                  {material.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="timeRange" label="投放时间" rules={[{ required: true }]}>
            <RangePicker
              showTime
              style={{ width: '100%' }}
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>
          <Form.Item name="priority" label="优先级" initialValue={0} help="数字越大优先级越高">
            <InputNumber style={{ width: '100%' }} min={0} max={100} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdSchedulesPage;
