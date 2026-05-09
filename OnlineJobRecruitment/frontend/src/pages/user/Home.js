import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Input, Select, Button, Row, Col, Tag, message, Avatar, Dropdown, Space } from 'antd';
import {
  SearchOutlined,
  HomeOutlined,
  AuditOutlined,
  BookOutlined,
  FileTextOutlined,
  MessageOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { jobApi, newsApi } from '../../services/api';

const { Header, Content, Sider, Footer } = Layout;
const { Search } = Input;
const { Option } = Select;

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobTypes, setJobTypes] = useState([]);
  const [hotJobs, setHotJobs] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [selectedKey, setSelectedKey] = useState('home');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [types, jobs, news] = await Promise.all([
        jobApi.getJobTypes(),
        jobApi.getJobs({ page: 1, page_size: 8 }),
        newsApi.getNews({ page: 1, page_size: 6 }),
      ]);
      setJobTypes(types || []);
      setHotJobs(jobs?.list || []);
      setNewsList(news?.list || []);
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

  const handleSearch = (value) => {
    navigate(`/jobs?keyword=${value}`);
  };

  const userMenuItems = user ? [
    {
      key: '1',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: '2',
      icon: <FileTextOutlined />,
      label: '我的简历',
      onClick: () => navigate('/resume'),
    },
    {
      key: '3',
      icon: <EyeOutlined />,
      label: '我投递的简历',
      onClick: () => navigate('/my-applications'),
    },
    {
      key: '4',
      icon: <SettingOutlined />,
      label: '修改密码',
      onClick: () => navigate('/change-password'),
    },
    {
      type: 'divider',
    },
    {
      key: '5',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
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
              selectedKeys={[selectedKey]}
              items={menuItems.map(item => ({
                ...item,
                onClick: () => {
                  setSelectedKey(item.key);
                  navigate(item.path);
                }
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
        <Card 
          style={{ 
            marginBottom: 24, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none'
          }}
        >
          <div style={{ textAlign: 'center', color: '#fff', padding: '30px 0' }}>
            <h2 style={{ color: '#fff', marginBottom: 20, fontSize: 32 }}>
              找工作，上求职招聘系统
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 30 }}>
              海量优质职位，助你找到理想工作
            </p>
            <Search
              placeholder="搜索职位、公司、地点..."
              allowClear
              enterButton="搜索"
              size="large"
              onSearch={handleSearch}
              style={{ maxWidth: 600 }}
            />
          </div>
        </Card>

        <Card title="职位类型" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {jobTypes.map(type => (
              <Button 
                key={type.id} 
                onClick={() => navigate(`/jobs?job_type_id=${type.id}`)}
              >
                {type.name}
              </Button>
            ))}
          </div>
        </Card>

        <Row gutter={[24, 24]}>
          <Col span={16}>
            <Card 
              title="热门职位" 
              extra={<Link to="/jobs">查看更多</Link>}
            >
              <Row gutter={[16, 16]}>
                {hotJobs.map(job => (
                  <Col span={12} key={job.id}>
                    <Card 
                      hoverable
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <h4 style={{ marginBottom: 8 }}>{job.title}</h4>
                          <p style={{ color: '#666', marginBottom: 8 }}>{job.company}</p>
                          <div>
                            <Tag color="blue">{job.location}</Tag>
                            <Tag color="green">{job.experience}</Tag>
                          </div>
                        </div>
                        <div style={{ color: '#f5222d', fontWeight: 'bold', fontSize: 18 }}>
                          {job.salary}
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
          <Col span={8}>
            <Card 
              title="招聘资讯" 
              extra={<Link to="/news">查看更多</Link>}
            >
              {newsList.map(news => (
                <div 
                  key={news.id}
                  style={{ 
                    padding: '12px 0', 
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/news/${news.id}`)}
                >
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{news.title}</div>
                  <div style={{ color: '#999', fontSize: 12 }}>
                    浏览 {news.views} 次
                  </div>
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#001529', color: 'rgba(255,255,255,0.65)' }}>
        网上求职招聘管理系统 ©2024 Created by Go + React
      </Footer>
    </Layout>
  );
};

export default Home;
