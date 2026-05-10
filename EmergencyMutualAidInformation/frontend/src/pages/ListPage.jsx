import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  List, 
  Input, 
  Select, 
  Pagination, 
  Spin, 
  Typography, 
  Tag, 
  Button,
  Modal,
  Form,
  InputNumber,
  TextArea,
  message,
  Space
} from 'antd';
import { 
  BellOutlined, 
  BoxOutlined, 
  HeartOutlined, 
  SafetyCertificateOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  LikeOutlined,
  DislikeOutlined,
  ShoppingCartOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { 
  noticeAPI, 
  materialAPI, 
  knowledgeAPI, 
  rumorAPI, 
  recruitmentAPI 
} from '../utils/api';

const { Title, Paragraph } = Typography;
const { Search } = Input;

const pageConfig = {
  notices: {
    title: '紧急通知',
    icon: <BellOutlined style={{ color: '#ff4d4f' }} />,
    api: noticeAPI,
    color: 'red'
  },
  materials: {
    title: '物资信息',
    icon: <BoxOutlined style={{ color: '#1890ff' }} />,
    api: materialAPI,
    color: 'blue'
  },
  knowledge: {
    title: '心理知识',
    icon: <HeartOutlined style={{ color: '#eb2f96' }} />,
    api: knowledgeAPI,
    color: 'pink'
  },
  rumors: {
    title: '辟谣专区',
    icon: <SafetyCertificateOutlined style={{ color: '#52c41a' }} />,
    api: rumorAPI,
    color: 'green'
  },
  recruitments: {
    title: '招募信息',
    icon: <TeamOutlined style={{ color: '#722ed1' }} />,
    api: recruitmentAPI,
    color: 'purple'
  }
};

const ListPage = ({ type }) => {
  const navigate = useNavigate();
  const params = useParams();
  const config = pageConfig[type];
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [detail, setDetail] = useState(null);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [applyForm] = Form.useForm();

  const isDetailView = !!params.id;

  useEffect(() => {
    if (isDetailView) {
      fetchDetail();
    } else {
      fetchList();
    }
  }, [type, page, params.id]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await config.api.getList({ page, page_size: pageSize, keyword });
      setData(res.list || []);
      setTotal(res.total || 0);
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await config.api.getDetail(params.id);
      setDetail(res);
    } catch (error) {
      message.error('获取详情失败');
      navigate(`/${type}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setKeyword(value);
    setPage(1);
    setTimeout(() => fetchList(), 0);
  };

  const handleLike = async (id) => {
    try {
      await recruitmentAPI.like(id);
      message.success('点赞成功');
      fetchDetail();
    } catch (error) {
      message.error('点赞失败');
    }
  };

  const handleDislike = async (id) => {
    try {
      await recruitmentAPI.dislike(id);
      message.success('感谢反馈');
      fetchDetail();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleApplyMaterial = async (values) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    try {
      await materialAPI.apply({
        material_id: parseInt(params.id),
        quantity: values.quantity,
        reason: values.reason
      });
      message.success('申请成功，请等待审核');
      setApplyModalVisible(false);
      applyForm.resetFields();
    } catch (error) {
      message.error(error.message || '申请失败');
    }
  };

  const handleApplyRecruitment = async (values) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    try {
      await recruitmentAPI.apply({
        recruitment_id: parseInt(params.id),
        phone: values.phone,
        experience: values.experience
      });
      message.success('报名成功，请等待审核');
      setApplyModalVisible(false);
      applyForm.resetFields();
    } catch (error) {
      message.error(error.message || '报名失败');
    }
  };

  if (isDetailView) {
    return (
      <div>
        <Button 
          icon={<ArrowLeftOutlined />} 
          style={{ marginBottom: 16 }}
          onClick={() => navigate(`/${type}`)}
        >
          返回列表
        </Button>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 100 }}>
            <Spin size="large" />
          </div>
        ) : detail ? (
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <Tag color={config.color}>{config.title}</Tag>
              {detail.level && <Tag color="red">{detail.level}</Tag>}
              {detail.category && <Tag color="blue">{detail.category}</Tag>}
            </Space>
            
            <Title level={2}>{detail.title}</Title>
            
            <div style={{ color: '#999', marginBottom: 24 }}>
              {detail.author_name && `发布者: ${detail.author_name}`}
              {detail.created_at && ` · ${new Date(detail.created_at).toLocaleString()}`}
              {detail.views !== undefined && ` · 阅读 ${detail.views} 次`}
            </div>

            {detail.summary && (
              <div style={{ 
                background: '#f5f5f5', 
                padding: 16, 
                borderRadius: 4, 
                marginBottom: 24 
              }}>
                <Paragraph strong style={{ margin: 0 }}>
                  摘要: {detail.summary}
                </Paragraph>
              </div>
            )}

            {type === 'materials' && (
              <div style={{ marginBottom: 24 }}>
                <Tag color="blue">库存: {detail.quantity} {detail.unit}</Tag>
                {detail.location && <Tag color="green">地点: {detail.location}</Tag>}
              </div>
            )}

            {type === 'recruitments' && (
              <div style={{ marginBottom: 24 }}>
                <Tag color="purple">职位: {detail.position}</Tag>
                <Tag color="blue">招募: {detail.number} 人</Tag>
                {detail.location && <Tag color="green">地点: {detail.location}</Tag>}
                {detail.deadline && <Tag color="orange">截止: {new Date(detail.deadline).toLocaleDateString()}</Tag>}
              </div>
            )}

            <Paragraph style={{ whiteSpace: 'pre-wrap', lineHeight: 2 }}>
              {detail.content}
            </Paragraph>

            {type === 'materials' && (
              <div style={{ marginTop: 32, textAlign: 'center' }}>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => setApplyModalVisible(true)}
                >
                  申请物资
                </Button>
              </div>
            )}

            {type === 'recruitments' && (
              <div style={{ marginTop: 32, textAlign: 'center' }}>
                <Space size="large">
                  <Button 
                    icon={<LikeOutlined />}
                    onClick={() => handleLike(detail.id)}
                  >
                    赞一下 ({detail.likes || 0})
                  </Button>
                  <Button 
                    icon={<DislikeOutlined />}
                    onClick={() => handleDislike(detail.id)}
                  >
                    踩一下 ({detail.dislikes || 0})
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<UserAddOutlined />}
                    onClick={() => setApplyModalVisible(true)}
                  >
                    在线报名
                  </Button>
                </Space>
              </div>
            )}
          </Card>
        ) : null}

        <Modal
          title={type === 'materials' ? '物资申请' : '在线报名'}
          open={applyModalVisible}
          onCancel={() => setApplyModalVisible(false)}
          footer={null}
          destroyOnClose
        >
          <Form
            form={applyForm}
            onFinish={type === 'materials' ? handleApplyMaterial : handleApplyRecruitment}
            layout="vertical"
          >
            {type === 'materials' && (
              <>
                <Form.Item
                  name="quantity"
                  label="申请数量"
                  rules={[{ required: true, message: '请输入申请数量' }]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                  name="reason"
                  label="申请理由"
                >
                  <TextArea rows={4} placeholder="请描述申请理由" />
                </Form.Item>
              </>
            )}
            {type === 'recruitments' && (
              <>
                <Form.Item
                  name="phone"
                  label="联系电话"
                  rules={[{ required: true, message: '请输入联系电话' }]}
                >
                  <Input placeholder="请输入联系电话" />
                </Form.Item>
                <Form.Item
                  name="experience"
                  label="相关经历"
                >
                  <TextArea rows={4} placeholder="请描述您的相关经历" />
                </Form.Item>
              </>
            )}
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                提交
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Space>
          {config.icon}
          <Title level={3} style={{ margin: 0 }}>{config.title}</Title>
        </Space>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Search
          placeholder="搜索..."
          allowClear
          enterButton="搜索"
          size="large"
          onSearch={handleSearch}
          style={{ maxWidth: 500 }}
        />
      </div>

      <Spin spinning={loading}>
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
          dataSource={data}
          renderItem={(item) => (
            <List.Item>
              <Link to={`/${type}/${item.id}`}>
                <Card hoverable style={{ height: '100%' }}>
                  <Space style={{ marginBottom: 8 }}>
                    <Tag color={config.color}>{config.title}</Tag>
                    {item.level && <Tag color="red">{item.level}</Tag>}
                    {item.category && <Tag color="blue">{item.category}</Tag>}
                  </Space>
                  
                  <Title level={5} style={{ marginBottom: 8 }} ellipsis={{ rows: 2 }}>
                    {item.title || item.name}
                  </Title>
                  
                  {type === 'materials' && (
                    <div style={{ color: '#1890ff', marginBottom: 8 }}>
                      库存: {item.quantity} {item.unit}
                    </div>
                  )}
                  
                  {type === 'recruitments' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', fontSize: 12 }}>
                      <span>{item.position}</span>
                      <span>👍 {item.likes || 0}</span>
                    </div>
                  )}
                  
                  {(item.summary || item.description) && (
                    <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
                      {item.summary || item.description}
                    </Paragraph>
                  )}
                  
                  {item.created_at && (
                    <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  )}
                </Card>
              </Link>
            </List.Item>
          )}
        />

        {total > 0 && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={setPage}
              showSizeChanger={false}
            />
          </div>
        )}

        {data.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: 50, color: '#999' }}>
            暂无数据
          </div>
        )}
      </Spin>
    </div>
  );
};

export default ListPage;
