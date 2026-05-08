import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Upload,
  message,
  Popconfirm,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { activityApi, uploadApi } from '../../utils/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, page_size: 10, total: 0 });
  const [filters, setFilters] = useState({ keyword: '', category: '', status: '' });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [form] = Form.useForm();

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await activityApi.getList({
        ...pagination,
        ...filters,
      });
      setActivities(res.data.list || []);
      setPagination(prev => ({ ...prev, total: res.data.total }));
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [pagination.page, filters]);

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'orange', text: '待开始' },
      active: { color: 'green', text: '报名中' },
      ongoing: { color: 'blue', text: '进行中' },
      completed: { color: 'purple', text: '已完成' },
      cancelled: { color: 'red', text: '已取消' },
    };
    const info = statusMap[status] || { color: 'default', text: '未知' };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, keyword: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCategoryChange = (value) => {
    setFilters(prev => ({ ...prev, category: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = (value) => {
    setFilters(prev => ({ ...prev, status: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleAdd = () => {
    setEditingActivity(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingActivity(record);
    form.setFieldsValue({
      ...record,
      dateRange: [dayjs(record.start_date), dayjs(record.end_date)],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await activityApi.delete(id);
      message.success('删除成功！');
      fetchActivities();
    } catch (error) {
      console.error('Failed to delete activity:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        title: values.title,
        description: values.description,
        location: values.location,
        start_date: values.dateRange[0].toISOString(),
        end_date: values.dateRange[1].toISOString(),
        max_participants: values.max_participants,
        points: values.points,
        category: values.category,
        cover_image: values.cover_image,
      };

      if (editingActivity) {
        await activityApi.update(editingActivity.id, data);
        message.success('更新成功！');
      } else {
        await activityApi.create(data);
        message.success('创建成功！');
      }

      setModalVisible(false);
      fetchActivities();
    } catch (error) {
      console.error('Failed to submit activity:', error);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const res = await uploadApi.uploadImage(file);
      form.setFieldsValue({ cover_image: res.data.url });
      message.success('上传成功！');
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
    return false;
  };

  const columns = [
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: '开始时间',
      dataIndex: 'start_date',
      key: 'start_date',
      width: 160,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '人数',
      key: 'participants',
      width: 120,
      render: (_, record) => (
        <span>{record.current_participants}/{record.max_participants}</span>
      ),
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      width: 80,
      render: (points) => <Tag color="gold">{points}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个活动吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="是"
            cancelText="否"
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
    <Card
      title="活动管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          发布活动
        </Button>
      }
    >
      <div className="filter-bar">
        <Space size="middle">
          <Input.Search
            placeholder="搜索活动名称"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 250 }}
            onSearch={handleSearch}
          />
          <Select
            placeholder="选择分类"
            allowClear
            style={{ width: 150 }}
            onChange={handleCategoryChange}
          >
            <Option value="环保">环保</Option>
            <Option value="支教">支教</Option>
            <Option value="社区服务">社区服务</Option>
            <Option value="赛事服务">赛事服务</Option>
            <Option value="其他">其他</Option>
          </Select>
          <Select
            placeholder="选择状态"
            allowClear
            style={{ width: 150 }}
            onChange={handleStatusChange}
          >
            <Option value="pending">待开始</Option>
            <Option value="active">报名中</Option>
            <Option value="ongoing">进行中</Option>
            <Option value="completed">已完成</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={activities}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.page_size,
          total: pagination.total,
          showSizeChanger: false,
          onChange: (page) => setPagination(prev => ({ ...prev, page })),
        }}
      />

      <Modal
        title={editingActivity ? '编辑活动' : '发布活动'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="modal-form"
        >
          <Form.Item
            name="title"
            label="活动名称"
            rules={[{ required: true, message: '请输入活动名称' }]}
          >
            <Input placeholder="请输入活动名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="活动描述"
            rules={[{ required: true, message: '请输入活动描述' }]}
          >
            <TextArea rows={4} placeholder="请输入活动描述" />
          </Form.Item>

          <Form.Item
            name="location"
            label="活动地点"
            rules={[{ required: true, message: '请输入活动地点' }]}
          >
            <Input placeholder="请输入活动地点" />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="活动时间"
            rules={[{ required: true, message: '请选择活动时间' }]}
          >
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="max_participants"
                label="最大人数"
                rules={[{ required: true, message: '请输入最大人数' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入最大人数" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="points"
                label="活动积分"
                rules={[{ required: true, message: '请输入活动积分' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入活动积分" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="category"
            label="活动分类"
            rules={[{ required: true, message: '请选择活动分类' }]}
          >
            <Select placeholder="请选择活动分类">
              <Option value="环保">环保</Option>
              <Option value="支教">支教</Option>
              <Option value="社区服务">社区服务</Option>
              <Option value="赛事服务">赛事服务</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="cover_image"
            label="活动封面"
          >
            <Input placeholder="请上传或输入图片URL" />
            <Form.Item noStyle>
              <Upload
                name="file"
                showUploadList={false}
                beforeUpload={handleImageUpload}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>上传图片</Button>
              </Upload>
            </Form.Item>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingActivity ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Activities;
