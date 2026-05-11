import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  message, 
  Popconfirm,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  DatePicker
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, DollarOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import request from '../../utils/request';

const Finances = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [stats, setStats] = useState({ total_income: 0, total_expense: 0, net_income: 0, daily_stats: [] });
  const [dateRange, setDateRange] = useState([]);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { 
      title: '类型', 
      dataIndex: 'type', 
      key: 'type',
      render: (val) => val === '收入' ? <span style={{ color: '#52c41a' }}>收入</span> : <span style={{ color: '#ff4d4f' }}>支出</span>
    },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (val) => `¥${val.toFixed(2)}` },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '收货日期', dataIndex: 'receive_date', key: 'receive_date' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const loadData = async (params = {}) => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        request.get('/admin/finances', { 
          params: { 
            page: pagination.current, 
            page_size: pagination.pageSize,
            ...params 
          } 
        }),
        request.get('/admin/finances/stats', { params }),
      ]);
      setData(listRes.data.list);
      setPagination(prev => ({ ...prev, total: listRes.data.total }));
      setStats(statsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [pagination.current, pagination.pageSize]);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await request.delete(`/admin/finances/${id}`);
      message.success('删除成功');
      loadData({ start_date: dateRange[0], end_date: dateRange[1] });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await request.put(`/admin/finances/${editingItem.id}`, values);
        message.success('更新成功');
      } else {
        await request.post('/admin/finances', values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadData({ start_date: dateRange[0], end_date: dateRange[1] });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (values) => {
    const params = {};
    if (values.date && values.date.length === 2) {
      params.start_date = values.date[0].format('YYYY-MM-DD');
      params.end_date = values.date[1].format('YYYY-MM-DD');
      setDateRange([params.start_date, params.end_date]);
    } else {
      setDateRange([]);
    }
    setPagination(prev => ({ ...prev, current: 1 }));
    loadData(params);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setDateRange([]);
    setPagination(prev => ({ ...prev, current: 1 }));
    loadData();
  };

  const chartOption = {
    title: { text: '财务收支统计' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['收入', '支出'] },
    xAxis: {
      type: 'category',
      data: stats.daily_stats.map(item => item.date),
    },
    yAxis: {
      type: 'value',
      name: '金额(元)',
    },
    series: [
      {
        name: '收入',
        type: 'bar',
        data: stats.daily_stats.map(item => item.income),
        itemStyle: { color: '#52c41a' },
      },
      {
        name: '支出',
        type: 'bar',
        data: stats.daily_stats.map(item => item.expense),
        itemStyle: { color: '#ff4d4f' },
      },
    ],
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总收入"
              value={stats.total_income}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              suffix="元"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总支出"
              value={stats.total_expense}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#ff4d4f' }} />}
              suffix="元"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="净收入"
              value={stats.net_income}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="元"
              valueStyle={{ color: stats.net_income >= 0 ? '#1890ff' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <ReactECharts option={chartOption} style={{ height: 300 }} />
      </Card>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Form 
            form={searchForm} 
            layout="inline" 
            onFinish={handleSearch}
            style={{ marginBottom: 16 }}
          >
            <Form.Item name="date" label="收货日期范围">
              <DatePicker.RangePicker />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>查询</Button>
                <Button onClick={handleReset}>重置</Button>
              </Space>
            </Form.Item>
          </Form>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加记录
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑财务记录' : '添加财务记录'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="请选择类型">
              <Select.Option value="收入">收入</Select.Option>
              <Select.Option value="支出">支出</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="amount" label="金额" rules={[{ required: true, message: '请输入金额' }]}>
            <InputNumber style={{ width: '100%' }} placeholder="请输入金额" min={0} step={0.01} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="receive_date" label="收货日期">
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Finances;
