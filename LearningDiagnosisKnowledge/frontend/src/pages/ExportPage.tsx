import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Typography, Tag, Modal, Spin, Empty, Select, message } from 'antd';
import { DownloadOutlined, ReloadOutlined, FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { exportApi, subjectApi } from '../services';
import { useAuth } from '../contexts/AuthContext';
import type { ExportRecord, Subject } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;

export default function ExportPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exports, setExports] = useState<ExportRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [exportForm, setExportForm] = useState({
    type: 'student_report',
    format: 'pdf',
    subjectId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [exportsResult, subs] = await Promise.all([
        exportApi.getMyExports(),
        subjectApi.getList(),
      ]);
      setExports(exportsResult.list || []);
      setSubjects(subs);
      if (subs.length > 0) {
        setExportForm(prev => ({ ...prev, subjectId: subs[0].id }));
      }
    } catch (error) {
      console.error('加载导出记录失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExport = async () => {
    try {
      const params: any = {
        type: exportForm.type,
        format: exportForm.format,
        subjectId: exportForm.subjectId ? Number(exportForm.subjectId) : undefined,
      };
      if (user?.role === 'student') {
        params.studentId = Number(user.id);
      }
      await exportApi.create(params);
      setModalVisible(false);
      message.success('导出任务已创建，请稍候...');
      loadData();
    } catch (error: any) {
      message.error(error || '创建导出任务失败');
    }
  };

  const handleDownload = async (record: ExportRecord) => {
    if (record.status === 'completed') {
      try {
        await exportApi.download(record.id);
        message.success('下载成功');
      } catch (error: any) {
        message.error(error || '下载失败');
      }
    } else {
      message.info('导出尚未完成，请稍候...');
    }
  };

  const getTypeText = (type: string) => {
    const texts: Record<string, string> = {
      student_report: '学生学情报告',
      class_report: '班级学情报告',
      answer_records: '答题记录',
      mastery_data: '掌握度数据',
      question_bank: '题库数据',
    };
    return texts[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'default',
      processing: 'blue',
      completed: 'green',
      failed: 'red',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: '等待处理',
      processing: '处理中',
      completed: '已完成',
      failed: '失败',
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: '导出类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => getTypeText(type),
    },
    {
      title: '格式',
      dataIndex: 'format',
      key: 'format',
      render: (format: string) => <Tag color="blue">{format.toUpperCase()}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (name?: string) => name || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: ExportRecord) => (
        <Button
          type="link"
          size="small"
          icon={<DownloadOutlined />}
          disabled={record.status !== 'completed'}
          onClick={() => handleDownload(record)}
        >
          下载
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>报告导出</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            申请导出
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          dataSource={exports}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="暂无导出记录" /> }}
        />
      </Card>

      <Modal
        title="申请导出"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>取消</Button>,
          <Button key="export" type="primary" onClick={handleCreateExport}>确认导出</Button>,
        ]}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong>导出类型</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={exportForm.type}
              onChange={(v) => setExportForm(prev => ({ ...prev, type: v }))}
            >
              <Option value="student_report">学生学情报告</Option>
              <Option value="answer_records">答题记录</Option>
              <Option value="mastery_data">掌握度数据</Option>
            </Select>
          </div>
          <div>
            <Text strong>导出格式</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={exportForm.format}
              onChange={(v) => setExportForm(prev => ({ ...prev, format: v }))}
            >
              <Option value="pdf">PDF 格式</Option>
              <Option value="excel">Excel 格式</Option>
              <Option value="csv">CSV 格式</Option>
              <Option value="json">JSON 格式</Option>
            </Select>
          </div>
          <div>
            <Text strong>学科（可选）</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={exportForm.subjectId}
              onChange={(v) => setExportForm(prev => ({ ...prev, subjectId: v }))}
              allowClear
            >
              {subjects.map((s) => (
                <Option key={s.id} value={s.id}>{s.name}</Option>
              ))}
            </Select>
          </div>
        </Space>
      </Modal>
    </div>
  );
}
