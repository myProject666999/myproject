import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Input, Select, Button, Row, Col, Tag, message, Avatar, Dropdown, Space, Pagination, Empty } from 'antd';
import {
  SearchOutlined,
  HomeOutlined,
  AuditOutlined,
  BookOutlined,
  MessageOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { jobApi, resumeApi } from '../../services/api';

const { Header, Content, Footer } = Layout;
const { Search } = Input;
const { Option } = Select;

const Jobs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobTypes, setJobTypes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({
    keyword: '',
    job_type_id: '',
    location: '',
    salary: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get('keyword') || '';
    const jobTypeId = params.get('job_type_id') || '';
    
    setFilters(prev => ({
      ...prev,
      keyword,
      job_type_id: jobTypeId,
    }));
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    loadJobTypes();
  }, [location.search]);

  useEffect(() => {
    loadJobs();
  }, [page, filters]);

  const loadJobTypes = async () => {
    try {
      const data = await jobApi.getJobTypes();
      setJobTypes(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadJobs = async () => {
    try {
      const params = {
        page,
        page_size: pageSize,
        ...filters,
      };
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      const data = await jobApi.getJobs(params);
      setJobs(data?.list || []);
      setTotal(data?.total || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    message.success('已退出登录');
    navigate('/login');
  };

  const handleApply = async (jobId) => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    try {
      await resumeApi.applyJob({ job_id: jobId });
      message.success('投递成功');
    } catch (error) {
      console.error(error);
    }
  };

  const userMenuItems = user ? [
    { key: '1', icon: <UserOutlined />, label: '个人中心', onClick: () => navigate('/profile') },
    { key: '2', icon: <EyeOutlined />, label: '我的简历', onClick: () => navigate('/resume') },
    { key: '3', icon: <SettingOutlined />, label: '修改密码', onClick: () => navigate('/change-password') },
    { type: 'divider' },
    { key: '5', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
  ] : [];

  const menuItems = [
    { key: 'home', icon: <HomeOutlined />, label: '首页', path: '/' },
    { key: 'jobs', icon: <AuditOutlined />, label: '职位列表', path: '/jobs' },
    { key: 'exercises', icon: <BookOutlined />, label: '在线练习', path: '/exercises' },
    { key: 'news', icon: <MessageOutlined />, label: '招聘资讯', path: '/news' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 50px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h1 style={{ margin: 0, marginRight: 40, fontSize: 22, fontWeight: 'bold' }}>
              求职招聘系统
            </h1>
            <Menu
              mode="horizontal"
              selectedKeys={['jobs']}
              items={menuItems.map(item => ({
                ...item,
                onClick: () => navigate(item.path)
              }))}
              style={{ border: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {user ? (
              <Dropdown menu={{ items: userMenuItems }}>
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar icon={<UserOutlined />} />
                  <span>{user.name || user.username}</span>
                </Space>
              </Dropdown>
            ) : (
              <>
                <Button type="link" onClick={() => navigate('/login')}>登录</Button>
                <Button type="primary" onClick={() => navigate('/register')}>注册</Button>
              </>
            )}
          </div>
        </div>
      </Header>

      <Content style={{ padding: '24px 50px' }}>
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <Search
              placeholder="搜索职位关键词"
              value={filters.keyword}
              onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
              style={{ width: 300 }}
              onSearch={(value) => {
                setFilters(prev => ({ ...prev, keyword: value }));
                setPage(1);
              }}
            />
            <Select
              placeholder="选择职位类型"
              value={filters.job_type_id || undefined}
              onChange={(value) => {
                setFilters(prev => ({ ...prev, job_type_id: value }));
                setPage(1);
              }}
              style={{ width: 180 }}
              allowClear
            >
              {jobTypes.map(type => (
                <Option key={type.id} value={type.id}>{type.name}</Option>
              ))}
            </Select>
            <Select
              placeholder="选择工作地点"
              value={filters.location || undefined}
              onChange={(value) => {
                setFilters(prev => ({ ...prev, location: value }));
                setPage(1);
              }}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="北京">北京</Option>
              <Option value="上海">上海</Option>
              <Option value="广州">广州</Option>
              <Option value="深圳">深圳</Option>
              <Option value="杭州">杭州</Option>
            </Select>
            <Select
              placeholder="薪资范围"
              value={filters.salary || undefined}
              onChange={(value) => {
                setFilters(prev => ({ ...prev, salary: value }));
                setPage(1);
              }}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="5k">5k以下</Option>
              <Option value="5k-10k">5k-10k</Option>
              <Option value="10k-15k">10k-15k</Option>
              <Option value="15k-20k">15k-20k</Option>
              <Option value="20k">20k以上</Option>
            </Select>
          </div>
        </Card>

        {jobs.length === 0 ? (
          <Empty description="暂无职位" />
        ) : (
          <Row gutter={[16, 16]}>
            {jobs.map(job => (
              <Col span={24} key={job.id}>
                <Card hoverable>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/jobs/${job.id}`)}>
                      <h3 style={{ marginBottom: 8 }}>{job.title}</h3>
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ fontWeight: 'bold', color: '#f5222d', marginRight: 16 }}>{job.salary}</span>
                        <span style={{ color: '#666', marginRight: 16 }}>{job.company}</span>
                      </div>
                      <div>
                        <Tag>{job.location}</Tag>
                        <Tag>{job.experience}</Tag>
                        <Tag>{job.education}</Tag>
                        {job.job_type && <Tag color="blue">{job.job_type.name}</Tag>}
                      </div>
                    </div>
                    <Button type="primary" onClick={(e) => { e.stopPropagation(); handleApply(job.id); }}>
                      立即投递
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {total > 0 && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination
              current={page}
              total={total}
              pageSize={pageSize}
              onChange={setPage}
              showSizeChanger={false}
            />
          </div>
        )}
      </Content>

      <Footer style={{ textAlign: 'center', background: '#001529', color: 'rgba(255,255,255,0.65)' }}>
        网上求职招聘管理系统 ©2024 Created by Go + React
      </Footer>
    </Layout>
  );
};

export default Jobs;
