import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link } from 'react-router-dom';
import { 
  Layout, 
  Menu, 
  Card, 
  Button, 
  Table, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  message, 
  Typography,
  Statistic,
  Row,
  Col,
  Tag,
  Space,
  Popconfirm,
  DatePicker
} from 'antd';
import { 
  DashboardOutlined,
  UserOutlined,
  BellOutlined,
  BoxOutlined,
  HeartOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  MailOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { adminAPI, noticeAPI, materialAPI, knowledgeAPI, rumorAPI, recruitmentAPI, userAPI } from '../utils/api';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Admin = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (!token || !savedUser) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(savedUser);
    if (parsedUser.role !== 'admin') {
      message.warning('需要管理员权限');
      navigate('/');
      return;
    }
    setUser(parsedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    message.success('已退出登录');
    navigate('/login');
  };

  const menuItems = [
    { key: '/admin', icon: <DashboardOutlined />, label: <Link to="/admin">仪表盘</Link> },
    { key: '/admin/users', icon: <UserOutlined />, label: <Link to="/admin/users">用户管理</Link> },
    { key: '/admin/notices', icon: <BellOutlined />, label: <Link to="/admin/notices">紧急通知</Link> },
    { key: '/admin/materials', icon: <BoxOutlined />, label: <Link to="/admin/materials">物资管理</Link> },
    { key: '/admin/applications', icon: <FileTextOutlined />, label: <Link to="/admin/applications">物资申请</Link> },
    { key: '/admin/knowledge', icon: <HeartOutlined />, label: <Link to="/admin/knowledge">心理知识</Link> },
    { key: '/admin/rumors', icon: <SafetyCertificateOutlined />, label: <Link to="/admin/rumors">辟谣管理</Link> },
    { key: '/admin/recruitments', icon: <TeamOutlined />, label: <Link to="/admin/recruitments">招募管理</Link> },
    { key: '/admin/recruitment-applications', icon: <MailOutlined />, label: <Link to="/admin/recruitment-applications">招募报名</Link> },
    { key: '/admin/volunteers', icon: <TeamOutlined />, label: <Link to="/admin/volunteers">志愿者管理</Link> },
    { key: '/admin/help-requests', icon: <FileTextOutlined />, label: <Link to="/admin/help-requests">求助信管理</Link> },
    { key: '/admin/medical-aids', icon: <MedicineBoxOutlined />, label: <Link to="/admin/medical-aids">医疗救助</Link> },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 12 : 18,
          fontWeight: 'bold'
        }}>
          {collapsed ? '应急' : '应急互助后台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[window.location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Title level={4} style={{ margin: 0 }}>管理后台</Title>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            退出登录
          </Button>
        </Header>
        <Content style={{ margin: '24px', minHeight: 280 }}>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="notices" element={<NoticesPage />} />
            <Route path="materials" element={<MaterialsPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="knowledge" element={<KnowledgePage />} />
            <Route path="rumors" element={<RumorsPage />} />
            <Route path="recruitments" element={<RecruitmentsPage />} />
            <Route path="recruitment-applications" element={<RecruitmentApplicationsPage />} />
            <Route path="volunteers" element={<VolunteersPage />} />
            <Route path="help-requests" element={<HelpRequestsPage />} />
            <Route path="medical-aids" element={<MedicalAidsPage />} />
            <Route path="password" element={<ChangePasswordPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [helpStats, setHelpStats] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [dashboard, help] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getHelpRequestStats()
      ]);
      setStats(dashboard);
      setHelpStats(help);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="用户总数" value={stats.user_count || 0} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="紧急通知" value={stats.notice_count || 0} prefix={<BellOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="物资数量" value={stats.material_count || 0} prefix={<BoxOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="招募信息" value={stats.recruitment_count || 0} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="待审核物资申请" value={stats.pending_applications || 0} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="待审核招募报名" value={stats.pending_recruitments || 0} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      <Card title="求助信统计" style={{ marginTop: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="总数" value={helpStats.total || 0} />
          </Col>
          <Col span={6}>
            <Statistic title="待审核" value={helpStats.pending || 0} valueStyle={{ color: '#faad14' }} />
          </Col>
          <Col span={6}>
            <Statistic title="已通过" value={helpStats.approved || 0} valueStyle={{ color: '#52c41a' }} />
          </Col>
          <Col span={6}>
            <Statistic title="已拒绝" value={helpStats.rejected || 0} valueStyle={{ color: '#ff4d4f' }} />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchUsers();
  }, [pagination.current]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ 
        page: pagination.current, 
        page_size: pagination.pageSize 
      });
      setUsers(res.list || []);
      setPagination(p => ({ ...p, total: res.total || 0 }));
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteUser(id);
      message.success('删除成功');
      fetchUsers();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        await adminAPI.updateUser(editingUser.id, values);
        message.success('更新成功');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '真实姓名', dataIndex: 'real_name', key: 'real_name' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { 
      title: '角色', 
      dataIndex: 'role', 
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>{role === 'admin' ? '管理员' : '用户'}</Tag>
      )
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '正常' : '禁用'}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm
            title="确定要删除吗?"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card>
        <Table 
          columns={columns} 
          dataSource={users} 
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            onChange: (page) => setPagination(p => ({ ...p, current: page }))
          }}
        />
      </Card>

      <Modal
        title="编辑用户"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
          <Form.Item name="real_name" label="真实姓名">
            <Input />
          </Form.Item>
          <Form.Item name="avatar" label="头像URL">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色">
            <Select>
              <Option value="user">用户</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Option value={1}>正常</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>保存</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const createCRUDPage = (apiConfig, formFields) => {
  return function CRUDPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    useEffect(() => {
      fetchData();
    }, [pagination.current]);

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiConfig.getList({ 
          page: pagination.current, 
          page_size: pagination.pageSize 
        });
        setData(res.list || []);
        setPagination(p => ({ ...p, total: res.total || 0 }));
      } catch (error) {
        message.error('获取列表失败');
      } finally {
        setLoading(false);
      }
    };

    const handleAdd = () => {
      setEditingItem(null);
      form.resetFields();
      setModalVisible(true);
    };

    const handleEdit = (item) => {
      setEditingItem(item);
      form.setFieldsValue(item);
      setModalVisible(true);
    };

    const handleDelete = async (id) => {
      try {
        await apiConfig.delete(id);
        message.success('删除成功');
        fetchData();
      } catch (error) {
        message.error('删除失败');
      }
    };

    const handleSubmit = async (values) => {
      try {
        if (editingItem) {
          await apiConfig.update(editingItem.id, values);
          message.success('更新成功');
        } else {
          await apiConfig.create(values);
          message.success('创建成功');
        }
        setModalVisible(false);
        fetchData();
      } catch (error) {
        message.error('操作失败');
      }
    };

    const columns = [
      { title: 'ID', dataIndex: 'id', key: 'id' },
      { title: '标题/名称', dataIndex: apiConfig.nameField || 'title', key: 'title' },
      ...(apiConfig.columns || []),
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (date) => date && new Date(date).toLocaleString()
      },
      {
        title: '操作',
        key: 'action',
        render: (_, record) => (
          <Space>
            <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
            <Popconfirm
              title="确定要删除吗?"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger>删除</Button>
            </Popconfirm>
          </Space>
        )
      }
    ];

    return (
      <div>
        <Card
          extra={<Button type="primary" onClick={handleAdd}>添加</Button>}
        >
          <Table 
            columns={columns} 
            dataSource={data} 
            loading={loading}
            rowKey="id"
            pagination={{
              ...pagination,
              onChange: (page) => setPagination(p => ({ ...p, current: page }))
            }}
          />
        </Card>

        <Modal
          title={editingItem ? '编辑' : '添加'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {formFields.map(field => (
              <Form.Item 
                key={field.name} 
                name={field.name} 
                label={field.label}
                rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : []}
              >
                {field.type === 'textarea' ? (
                  <TextArea rows={4} />
                ) : field.type === 'number' ? (
                  <InputNumber style={{ width: '100%' }} min={field.min || 0} />
                ) : field.type === 'select' ? (
                  <Select>
                    {field.options.map(opt => (
                      <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                    ))}
                  </Select>
                ) : (
                  <Input />
                )}
              </Form.Item>
            ))}
            <Form.Item>
              <Button type="primary" htmlType="submit" block>保存</Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  };
};

const NoticesPage = createCRUDPage(
  {
    getList: noticeAPI.getList,
    create: noticeAPI.create,
    update: noticeAPI.update,
    delete: noticeAPI.delete,
    columns: [
      { 
        title: '级别', 
        dataIndex: 'level', 
        key: 'level',
        render: (level) => <Tag color="red">{level}</Tag>
      },
      { title: '浏览量', dataIndex: 'views', key: 'views' }
    ]
  },
  [
    { name: 'title', label: '标题', required: true },
    { name: 'summary', label: '摘要' },
    { name: 'content', label: '内容', required: true, type: 'textarea' },
    { 
      name: 'level', 
      label: '级别', 
      required: true, 
      type: 'select',
      options: [
        { value: '紧急', label: '紧急' },
        { value: '重要', label: '重要' },
        { value: '一般', label: '一般' }
      ]
    }
  ]
);

const MaterialsPage = createCRUDPage(
  {
    getList: materialAPI.getList,
    create: materialAPI.create,
    update: materialAPI.update,
    delete: materialAPI.delete,
    nameField: 'name',
    columns: [
      { title: '分类', dataIndex: 'category', key: 'category' },
      { title: '库存', dataIndex: 'quantity', key: 'quantity' },
      { title: '单位', dataIndex: 'unit', key: 'unit' },
      { title: '位置', dataIndex: 'location', key: 'location' }
    ]
  },
  [
    { name: 'name', label: '名称', required: true },
    { name: 'description', label: '描述', type: 'textarea' },
    { name: 'category', label: '分类' },
    { name: 'quantity', label: '数量', type: 'number', required: true },
    { name: 'unit', label: '单位' },
    { name: 'location', label: '位置' }
  ]
);

const KnowledgePage = createCRUDPage(
  {
    getList: knowledgeAPI.getList,
    create: knowledgeAPI.create,
    update: knowledgeAPI.update,
    delete: knowledgeAPI.delete,
    columns: [
      { title: '分类', dataIndex: 'category', key: 'category' },
      { title: '浏览量', dataIndex: 'views', key: 'views' }
    ]
  },
  [
    { name: 'title', label: '标题', required: true },
    { name: 'summary', label: '摘要' },
    { name: 'content', label: '内容', required: true, type: 'textarea' },
    { name: 'category', label: '分类' }
  ]
);

const RumorsPage = createCRUDPage(
  {
    getList: rumorAPI.getList,
    create: rumorAPI.create,
    update: rumorAPI.update,
    delete: rumorAPI.delete
  },
  [
    { name: 'title', label: '标题', required: true },
    { name: 'content', label: '内容', required: true, type: 'textarea' }
  ]
);

const RecruitmentsPage = createCRUDPage(
  {
    getList: recruitmentAPI.getList,
    create: recruitmentAPI.create,
    update: recruitmentAPI.update,
    delete: recruitmentAPI.delete,
    columns: [
      { title: '职位', dataIndex: 'position', key: 'position' },
      { title: '人数', dataIndex: 'number', key: 'number' },
      { title: '地点', dataIndex: 'location', key: 'location' },
      { title: '点赞', dataIndex: 'likes', key: 'likes' },
      { title: '点踩', dataIndex: 'dislikes', key: 'dislikes' }
    ]
  },
  [
    { name: 'title', label: '标题', required: true },
    { name: 'position', label: '职位' },
    { name: 'number', label: '招募人数', type: 'number' },
    { name: 'location', label: '地点' },
    { name: 'content', label: '内容', required: true, type: 'textarea' }
  ]
);

const createApprovalPage = (apiConfig, extraColumns = []) => {
  return function ApprovalPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    useEffect(() => {
      fetchData();
    }, [pagination.current, status]);

    const fetchData = async () => {
      setLoading(true);
      try {
        const params = { 
          page: pagination.current, 
          page_size: pagination.pageSize 
        };
        if (status) params.status = status;
        const res = await apiConfig.getList(params);
        setData(res.list || []);
        setPagination(p => ({ ...p, total: res.total || 0 }));
      } catch (error) {
        message.error('获取列表失败');
      } finally {
        setLoading(false);
      }
    };

    const handleApprove = async (id, approved) => {
      try {
        await apiConfig.approve(id, { status: approved ? 1 : 2 });
        message.success(approved ? '已通过' : '已拒绝');
        fetchData();
      } catch (error) {
        message.error('操作失败');
      }
    };

    const getStatusTag = (status) => {
      const map = {
        0: <Tag color="orange">待审核</Tag>,
        1: <Tag color="green">已通过</Tag>,
        2: <Tag color="red">已拒绝</Tag>
      };
      return map[status] || status;
    };

    const columns = [
      { title: 'ID', dataIndex: 'id', key: 'id' },
      { title: apiConfig.titleField || '物资/招募', dataIndex: apiConfig.titleField || 'material_name', key: 'name' },
      { title: '申请人', dataIndex: 'user_name', key: 'user_name' },
      ...extraColumns,
      { 
        title: '状态', 
        dataIndex: 'status', 
        key: 'status',
        render: getStatusTag
      },
      {
        title: '申请时间',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (date) => date && new Date(date).toLocaleString()
      },
      {
        title: '操作',
        key: 'action',
        render: (_, record) => record.status === 0 && (
          <Space>
            <Popconfirm
              title="确定通过吗?"
              onConfirm={() => handleApprove(record.id, true)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" style={{ color: '#52c41a' }}>通过</Button>
            </Popconfirm>
            <Popconfirm
              title="确定拒绝吗?"
              onConfirm={() => handleApprove(record.id, false)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger>拒绝</Button>
            </Popconfirm>
          </Space>
        )
      }
    ];

    return (
      <div>
        <Card
          extra={
            <Select 
              style={{ width: 120 }} 
              value={status} 
              onChange={setStatus}
              placeholder="全部状态"
              allowClear
            >
              <Option value="">全部</Option>
              <Option value="0">待审核</Option>
              <Option value="1">已通过</Option>
              <Option value="2">已拒绝</Option>
            </Select>
          }
        >
          <Table 
            columns={columns} 
            dataSource={data} 
            loading={loading}
            rowKey="id"
            pagination={{
              ...pagination,
              onChange: (page) => setPagination(p => ({ ...p, current: page }))
            }}
          />
        </Card>
      </div>
    );
  };
};

const ApplicationsPage = createApprovalPage(
  {
    getList: adminAPI.getApplications,
    approve: adminAPI.approveApplication,
    titleField: 'material_name'
  },
  [
    { title: '申请数量', dataIndex: 'quantity', key: 'quantity' }
  ]
);

const RecruitmentApplicationsPage = createApprovalPage(
  {
    getList: adminAPI.getRecruitmentApplications,
    approve: adminAPI.approveRecruitmentApplication,
    titleField: 'recruitment_title'
  },
  [
    { title: '联系电话', dataIndex: 'phone', key: 'phone' }
  ]
);

const VolunteersPage = createCRUDPage(
  {
    getList: adminAPI.getVolunteers,
    create: adminAPI.createVolunteer,
    update: adminAPI.updateVolunteer,
    delete: adminAPI.deleteVolunteer,
    nameField: 'name',
    columns: [
      { title: '电话', dataIndex: 'phone', key: 'phone' },
      { title: '邮箱', dataIndex: 'email', key: 'email' },
      { title: '技能', dataIndex: 'skills', key: 'skills' }
    ]
  },
  [
    { name: 'name', label: '姓名', required: true },
    { name: 'phone', label: '电话' },
    { name: 'email', label: '邮箱' },
    { name: 'skills', label: '技能' },
    { name: 'experience', label: '经验', type: 'textarea' },
    { name: 'photo', label: '照片URL' }
  ]
);

const HelpRequestsPage = createApprovalPage(
  {
    getList: adminAPI.getHelpRequests,
    approve: adminAPI.approveHelpRequest,
    titleField: 'title'
  },
  [
    { title: '地点', dataIndex: 'location', key: 'location' },
    { title: '电话', dataIndex: 'phone', key: 'phone' }
  ]
);

const MedicalAidsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [detail, setDetail] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchData();
  }, [pagination.current, status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { 
        page: pagination.current, 
        page_size: pagination.pageSize 
      };
      if (status) params.status = status;
      const res = await adminAPI.getMedicalAids(params);
      setData(res.list || []);
      setPagination(p => ({ ...p, total: res.total || 0 }));
    } catch (error) {
      message.error('获取列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id) => {
    try {
      const res = await adminAPI.getMedicalAid(id);
      setDetail(res);
      setDetailVisible(true);
    } catch (error) {
      message.error('获取详情失败');
    }
  };

  const handleApprove = async (id, approved) => {
    try {
      await adminAPI.approveMedicalAid(id, { status: approved ? 1 : 2 });
      message.success(approved ? '已通过' : '已拒绝');
      fetchData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteMedicalAid(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const getStatusTag = (status) => {
    const map = {
      0: <Tag color="orange">待审核</Tag>,
      1: <Tag color="green">已通过</Tag>,
      2: <Tag color="red">已拒绝</Tag>
    };
    return map[status] || status;
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '申请人', dataIndex: 'user_name', key: 'user_name' },
    { title: '地点', dataIndex: 'location', key: 'location' },
    { title: '电话', dataIndex: 'phone', key: 'phone' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: getStatusTag
    },
    {
      title: '申请时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date && new Date(date).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleViewDetail(record.id)}>详情</Button>
          {record.status === 0 && (
            <>
              <Popconfirm
                title="确定通过吗?"
                onConfirm={() => handleApprove(record.id, true)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" style={{ color: '#52c41a' }}>通过</Button>
              </Popconfirm>
              <Popconfirm
                title="确定拒绝吗?"
                onConfirm={() => handleApprove(record.id, false)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" danger>拒绝</Button>
              </Popconfirm>
            </>
          )}
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card
        extra={
          <Select 
            style={{ width: 120 }} 
            value={status} 
            onChange={setStatus}
            placeholder="全部状态"
            allowClear
          >
            <Option value="">全部</Option>
            <Option value="0">待审核</Option>
            <Option value="1">已通过</Option>
            <Option value="2">已拒绝</Option>
          </Select>
        }
      >
        <Table 
          columns={columns} 
          dataSource={data} 
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            onChange: (page) => setPagination(p => ({ ...p, current: page }))
          }}
        />
      </Card>

      <Modal
        title="医疗救助详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
      >
        {detail && (
          <div>
            <p><strong>标题:</strong> {detail.title}</p>
            <p><strong>申请人:</strong> {detail.user_name}</p>
            <p><strong>地点:</strong> {detail.location}</p>
            <p><strong>电话:</strong> {detail.phone}</p>
            <p><strong>内容:</strong></p>
            <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              {detail.content}
            </div>
            <p style={{ marginTop: 16 }}><strong>状态:</strong> {getStatusTag(detail.status)}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

const ChangePasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    if (values.new_password !== values.confirm_password) {
      message.error('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    try {
      await userAPI.changePassword({
        old_password: values.old_password,
        new_password: values.new_password
      });
      message.success('密码修改成功');
      form.resetFields();
    } catch (error) {
      message.error(error.message || '密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400 }}>
      <Card title="修改密码">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="old_password"
            label="原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="new_password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            label="确认新密码"
            rules={[{ required: true, message: '请再次输入新密码' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Admin;
