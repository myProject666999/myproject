import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Button, Select, message, Modal } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { activityApi } from '../../utils/api';
import dayjs from 'dayjs';

const { Option } = Select;

const MyActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const fetchMyActivities = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await activityApi.getMyActivities(params);
      setActivities(res.data || []);
    } catch (error) {
      console.error('Failed to fetch my activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyActivities();
  }, [statusFilter]);

  const getStatusTag = (status) => {
    const statusMap = {
      registered: { color: 'blue', text: '已报名' },
      attended: { color: 'green', text: '已参加' },
      completed: { color: 'purple', text: '已完成' },
      cancelled: { color: 'red', text: '已取消' },
    };
    const info = statusMap[status] || { color: 'default', text: '未知' };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const handleCancel = (record) => {
    Modal.confirm({
      title: '取消报名',
      content: '您确定要取消这个活动的报名吗？',
      onOk: async () => {
        try {
          await activityApi.cancel(record.activity_id);
          message.success('取消报名成功！');
          fetchMyActivities();
        } catch (error) {
          console.error('Failed to cancel:', error);
        }
      },
    });
  };

  const columns = [
    {
      title: '活动名称',
      dataIndex: ['activity', 'title'],
      key: 'title',
      render: (text, record) => (
        <a onClick={() => navigate(`/activities/${record.activity_id}`)}>{text}</a>
      ),
    },
    {
      title: '活动分类',
      dataIndex: ['activity', 'category'],
      key: 'category',
    },
    {
      title: '活动地点',
      dataIndex: ['activity', 'location'],
      key: 'location',
    },
    {
      title: '开始时间',
      dataIndex: ['activity', 'start_date'],
      key: 'start_date',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '积分',
      dataIndex: ['activity', 'points'],
      key: 'points',
      render: (points) => <Tag color="gold">{points} 积分</Tag>,
    },
    {
      title: '报名状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/activities/${record.activity_id}`)}
          >
            查看
          </Button>
          {record.status === 'registered' && (
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleCancel(record)}
            >
              取消报名
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="我的活动"
      extra={
        <Select
          placeholder="筛选状态"
          allowClear
          style={{ width: 150 }}
          onChange={setStatusFilter}
        >
          <Option value="registered">已报名</Option>
          <Option value="attended">已参加</Option>
          <Option value="completed">已完成</Option>
          <Option value="cancelled">已取消</Option>
        </Select>
      }
    >
      <Table
        columns={columns}
        dataSource={activities}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
        }}
      />
    </Card>
  );
};

export default MyActivities;
