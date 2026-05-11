import { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Button, message, Modal, Form, Input, Select, DatePicker, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { adminAPI } from '../../api';

const { Option } = Select;

function ArchiveChangeManagementPage() {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchChanges();
  }, []);

  const fetchChanges = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getArchiveChanges();
      setChanges(res.data);
    } catch (error) {
      message.error('获取档案变动列表失败');
    } finally {
      setLoading(false);
    }
  };

  const showDetail = (record) => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  const showReview = (record) => {
    setSelectedRecord(record);
    setReviewVisible(true);
  };

  const handleReview = async (status) => {
    try {
      await adminAPI.reviewArchiveChange(selectedRecord.id, { status });
      message.success(status === 'approved' ? '审核通过' : '已驳回');
      setReviewVisible(false);
      fetchChanges();
    } catch (error) {
      message.error('审核失败');
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条变动记录吗？',
      onOk: async () => {
        try {
          await adminAPI.deleteArchiveChange(id);
          message.success('删除成功');
          fetchChanges();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const getStatusTag = (status) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red',
    };
    const texts = {
      pending: '待审核',
      approved: '已通过',
      rejected: '已驳回',
    };
    return <Tag color={colors[status]}>{texts[status]}</Tag>;
  };

  const getChangeTypeText = (type) => {
    const texts = {
      transfer: '调动',
      promotion: '晋升',
      demotion: '降职',
      resignation: '离职',
      other: '其他',
    };
    return texts[type] || type;
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '变动类型', dataIndex: 'change_type', key: 'change_type', render: getChangeTypeText },
    { title: '变动内容', dataIndex: 'content', key: 'content', ellipsis: true },
    { title: '申请人', dataIndex: 'applicant', key: 'applicant' },
    { title: '状态', dataIndex: 'status', key: 'status', render: getStatusTag },
    {
      title: '申请时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => showDetail(record)}>
            详情
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => showReview(record)}
              >
                审核
              </Button>
            </>
          )}
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>档案变动管理</h1>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={changes}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="档案变动详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {selectedRecord && (
          <Form layout="vertical">
            <Form.Item label="变动类型">
              <span>{getChangeTypeText(selectedRecord.change_type)}</span>
            </Form.Item>
            <Form.Item label="变动内容">
              <span>{selectedRecord.content}</span>
            </Form.Item>
            <Form.Item label="申请人">
              <span>{selectedRecord.applicant}</span>
            </Form.Item>
            <Form.Item label="审核状态">
              {getStatusTag(selectedRecord.status)}
            </Form.Item>
            {selectedRecord.reviewer && (
              <Form.Item label="审核人">
                <span>{selectedRecord.reviewer}</span>
              </Form.Item>
            )}
            <Form.Item label="申请时间">
              <span>{new Date(selectedRecord.created_at).toLocaleString()}</span>
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal
        title="审核档案变动"
        open={reviewVisible}
        onCancel={() => setReviewVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setReviewVisible(false)}>
            取消
          </Button>,
          <Button key="reject" danger onClick={() => handleReview('rejected')}>
            驳回
          </Button>,
          <Button key="approve" type="primary" onClick={() => handleReview('approved')}>
            通过
          </Button>,
        ]}
      >
        <p>确定要审核此档案变动申请吗？</p>
        {selectedRecord && (
          <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
            <p><strong>变动类型：</strong>{getChangeTypeText(selectedRecord.change_type)}</p>
            <p><strong>变动内容：</strong>{selectedRecord.content}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ArchiveChangeManagementPage;
