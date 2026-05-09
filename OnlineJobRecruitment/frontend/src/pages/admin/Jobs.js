import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Tag, Select, InputNumber } from 'antd';
import { EyeOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { jobApi } from '../../services/api';

const Jobs = () => {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [jobTypes, setJobTypes] = useState([]);

  useEffect(() => {
    loadData();
    loadJobTypes();
  }, [page, keyword]);

  const loadJobTypes = async () => {
    try {
      const data = await jobApi.getAllJobTypes();
      setJobTypes(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const params = { page, page_size: pageSize };
      if (keyword) params.keyword = keyword;
      const data = await jobApi.getAllJobs(params);
      setList(data?.list || []);
      setTotal(data?.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await jobApi.deleteJob(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleView = async (record) => {
    try {
      const data = await jobApi.getJob(record.id);
      setCurrentJob(data);
      setDetailVisible(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getJobTypeName = (jobTypeId) => {
    const type = jobTypes.find(t => t.id === jobTypeId);
    return type?.name || '-';
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '职位名称', dataIndex: 'title', key: 'title' },
    { title: '公司', dataIndex: 'company', key: 'company' },
    {
      title: '职位类型',
      dataIndex: 'job_type_id',
      key: 'job_type_id',
      render: (jobTypeId) => getJobTypeName(jobTypeId),
    },
    { title: '薪资', dataIndex: 'salary', key: 'salary' },
    { title: '地点', dataIndex: 'location', key: 'location' },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>详情</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input.Search
            placeholder="搜索职位名称、公司"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={() => setPage(1)}
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={list}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize,
          onChange: setPage,
          showSizeChanger: false,
        }}
      />

      <Modal
        title="职位详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>关闭</Button>,
        ]}
        width={700}
      >
        {currentJob && (
          <div>
            <Form layout="vertical">
              <Form.Item label="职位名称">
                <Input value={currentJob.title} disabled />
              </Form.Item>
              <Form.Item label="公司">
                <Input value={currentJob.company} disabled />
              </Form.Item>
              <Form.Item label="职位类型">
                <Input value={getJobTypeName(currentJob.job_type_id)} disabled />
              </Form.Item>
              <Form.Item label="薪资">
                <Input value={currentJob.salary} disabled />
              </Form.Item>
              <Form.Item label="工作地点">
                <Input value={currentJob.location} disabled />
              </Form.Item>
              <Form.Item label="经验要求">
                <Input value={currentJob.experience} disabled />
              </Form.Item>
              <Form.Item label="学历要求">
                <Input value={currentJob.education} disabled />
              </Form.Item>
              <Form.Item label="职位描述">
                <Input.TextArea value={currentJob.description} rows={4} disabled />
              </Form.Item>
              <Form.Item label="任职要求">
                <Input.TextArea value={currentJob.requirements} rows={4} disabled />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Jobs;
