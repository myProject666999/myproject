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
  Descriptions,
  message,
  Popconfirm,
  Switch,
} from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  CrownOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { volunteerApi } from '../../utils/api';
import dayjs from 'dayjs';

const { Option } = Select;

const Volunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, page_size: 10, total: 0 });
  const [filters, setFilters] = useState({ keyword: '', college: '', is_excellent: '' });
  const [colleges, setColleges] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const res = await volunteerApi.getList({
        ...pagination,
        ...filters,
      });
      setVolunteers(res.data.list || []);
      setPagination(prev => ({ ...prev, total: res.data.total }));
    } catch (error) {
      console.error('Failed to fetch volunteers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchColleges = async () => {
    try {
      const res = await volunteerApi.getColleges();
      setColleges(res.data || []);
    } catch (error) {
      console.error('Failed to fetch colleges:', error);
    }
  };

  useEffect(() => {
    fetchVolunteers();
    fetchColleges();
  }, [pagination.page, filters]);

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, keyword: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCollegeChange = (value) => {
    setFilters(prev => ({ ...prev, college: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExcellentChange = (value) => {
    setFilters(prev => ({ ...prev, is_excellent: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleViewDetail = async (id) => {
    try {
      const res = await volunteerApi.getDetail(id);
      setSelectedVolunteer(res.data);
      setDetailModalVisible(true);
    } catch (error) {
      console.error('Failed to fetch volunteer detail:', error);
    }
  };

  const handleToggleExcellent = async (record) => {
    try {
      await volunteerApi.toggleExcellent(record.id);
      message.success(record.is_excellent ? '已取消优秀志愿者称号' : '已设为优秀志愿者');
      fetchVolunteers();
    } catch (error) {
      console.error('Failed to toggle excellent:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await volunteerApi.delete(id);
      message.success('删除成功！');
      fetchVolunteers();
    } catch (error) {
      console.error('Failed to delete volunteer:', error);
    }
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '真实姓名',
      dataIndex: 'real_name',
      key: 'real_name',
    },
    {
      title: '学院',
      dataIndex: 'college',
      key: 'college',
    },
    {
      title: '专业',
      dataIndex: 'major',
      key: 'major',
    },
    {
      title: '学号',
      dataIndex: 'student_id',
      key: 'student_id',
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      render: (points) => (
        <Tag icon={<TrophyOutlined />} color="gold">
          {points}
        </Tag>
      ),
    },
    {
      title: '优秀志愿者',
      dataIndex: 'is_excellent',
      key: 'is_excellent',
      render: (isExcellent, record) => (
        <Switch
          checked={isExcellent}
          checkedChildren={<CrownOutlined />}
          unCheckedChildren="否"
          onChange={() => handleToggleExcellent(record)}
        />
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.id)}
          >
            详情
          </Button>
          <Popconfirm
            title="确定要删除这个志愿者吗？"
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
    <Card title="志愿者管理">
      <div className="filter-bar">
        <Space size="middle">
          <Input.Search
            placeholder="搜索用户名/姓名/学号"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 250 }}
            onSearch={handleSearch}
          />
          <Select
            placeholder="选择学院"
            allowClear
            style={{ width: 150 }}
            onChange={handleCollegeChange}
          >
            {colleges.map(college => (
              <Option key={college} value={college}>
                {college}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="优秀志愿者"
            allowClear
            style={{ width: 150 }}
            onChange={handleExcellentChange}
          >
            <Option value="true">是</Option>
            <Option value="false">否</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={volunteers}
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
        title="志愿者详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {selectedVolunteer && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="用户名">
              {selectedVolunteer.volunteer?.username}
            </Descriptions.Item>
            <Descriptions.Item label="真实姓名">
              {selectedVolunteer.volunteer?.real_name}
            </Descriptions.Item>
            <Descriptions.Item label="性别">
              {selectedVolunteer.volunteer?.gender || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="邮箱">
              {selectedVolunteer.volunteer?.email || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="手机号">
              {selectedVolunteer.volunteer?.phone || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="学院">
              {selectedVolunteer.volunteer?.college || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="专业">
              {selectedVolunteer.volunteer?.major || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="学号">
              {selectedVolunteer.volunteer?.student_id || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="总积分">
              <Tag color="gold">{selectedVolunteer.volunteer?.points}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="参与活动数">
              {selectedVolunteer.activity_count}
            </Descriptions.Item>
            <Descriptions.Item label="优秀志愿者" span={2}>
              {selectedVolunteer.volunteer?.is_excellent ? (
                <Tag color="gold" icon={<CrownOutlined />}>是</Tag>
              ) : (
                <Tag>否</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        )}

        {selectedVolunteer?.points_records?.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h4>积分记录</h4>
            <Table
              dataSource={selectedVolunteer.points_records}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: '时间',
                  dataIndex: 'created_at',
                  key: 'created_at',
                  render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
                },
                {
                  title: '类型',
                  dataIndex: 'type',
                  key: 'type',
                },
                {
                  title: '积分',
                  dataIndex: 'points',
                  key: 'points',
                  render: (points) => <span style={{ color: '#52c41a' }}>+{points}</span>,
                },
                {
                  title: '描述',
                  dataIndex: 'description',
                  key: 'description',
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default Volunteers;
