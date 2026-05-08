import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Avatar, message, Modal, Descriptions } from 'antd';
import { CrownOutlined, TrophyOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { volunteerApi } from '../../utils/api';
import dayjs from 'dayjs';

const ExcellentVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const res = await volunteerApi.getList({ is_excellent: 'true', page: 1, page_size: 100 });
      setVolunteers(res.data.list || []);
    } catch (error) {
      console.error('Failed to fetch volunteers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

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
      message.success('已取消优秀志愿者称号');
      fetchVolunteers();
    } catch (error) {
      console.error('Failed to toggle excellent:', error);
    }
  };

  const columns = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      render: (_, __, index) => {
        const colors = ['gold', 'orange', 'blue'];
        return (
          <Tag color={colors[index] || 'default'}>
            {index < 3 ? <CrownOutlined /> : null} {index + 1}
          </Tag>
        );
      },
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: (avatar) => (
        <Avatar icon={<UserOutlined />} src={avatar} />
      ),
    },
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
          <Button
            type="link"
            danger
            onClick={() => handleToggleExcellent(record)}
          >
            取消称号
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="优秀志愿者">
      <Table
        columns={columns}
        dataSource={volunteers}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
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
            <Descriptions.Item label="学院">
              {selectedVolunteer.volunteer?.college || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="专业">
              {selectedVolunteer.volunteer?.major || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="总积分">
              <Tag color="gold">{selectedVolunteer.volunteer?.points}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="参与活动数">
              {selectedVolunteer.activity_count}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  );
};

export default ExcellentVolunteers;
