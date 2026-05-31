import React, { useState, useEffect } from 'react';
import { Card, List, Button, Space, Typography, Tag, Modal, Spin, Empty, Row, Col, Progress, Statistic, Select, message } from 'antd';
import { FileTextOutlined, ShareAltOutlined, DownloadOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { reportApi, subjectApi, exportApi } from '../services';
import { useAuth } from '../contexts/AuthContext';
import type { LearningReport, Subject } from '../types';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function ReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<LearningReport[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedReport, setSelectedReport] = useState<LearningReport | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    type: 'student_personal',
    subjectId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsResult, subs] = await Promise.all([
        reportApi.getMyReports(),
        subjectApi.getList(),
      ]);
      setReports(reportsResult.list || []);
      setSubjects(subs);
      if (subs.length > 0) {
        setGenerateForm(prev => ({ ...prev, subjectId: subs[0].id }));
      }
    } catch (error: any) {
      console.error('加载报告失败', error);
      message.error(error || '加载报告数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!generateForm.subjectId) {
      message.warning('请选择学科');
      return;
    }
    try {
      message.loading('正在生成报告...', 0);
      const params: any = {
        type: generateForm.type,
        subjectId: Number(generateForm.subjectId),
      };
      if (user?.role === 'student') {
        params.studentId = Number(user.id);
      }
      await reportApi.generate(params);
      message.destroy();
      message.success('报告生成成功');
      setGenerateModalVisible(false);
      loadData();
    } catch (error: any) {
      message.destroy();
      message.error(error || '生成报告失败');
    }
  };

  const handleShare = async (id: string) => {
    try {
      const result = await reportApi.share(id);
      const shareUrl = `${window.location.origin}/#/share/${result.shareToken}`;
      Modal.info({
        title: '分享链接已生成',
        content: (
          <div>
            <p>分享链接：</p>
            <Text code copyable>{shareUrl}</Text>
          </div>
        ),
      });
    } catch (error: any) {
      message.error(error || '生成分享链接失败');
    }
  };

  const handleExport = async (report: LearningReport) => {
    try {
      const params: any = {
        type: 'student_report',
        format: 'pdf',
        subjectId: report.subjectId ? Number(report.subjectId) : undefined,
      };
      if (user?.role === 'student') {
        params.studentId = Number(user.id);
      }
      await exportApi.create(params);
      message.success('导出任务已创建');
    } catch (error: any) {
      message.error(error || '导出失败');
    }
  };

  const getReportTypeText = (type: string) => {
    const texts: Record<string, string> = {
      student_personal: '个人诊断',
      student_period: '阶段性学习',
      class_overall: '班级整体',
      class_comparison: '班级对比',
      diagnosis: '诊断测试',
    };
    return texts[type] || type;
  };

  const getReportTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      student_personal: 'blue',
      student_period: 'purple',
      class_overall: 'green',
      class_comparison: 'cyan',
      diagnosis: 'orange',
    };
    return colors[type] || 'default';
  };

  if (loading) return <Spin size="large" style={{ display: 'block', textAlign: 'center', marginTop: 100 }} />;

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>学情报告</Title>
        </Col>
        <Col>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setGenerateModalVisible(true)}>
              生成报告
            </Button>
          </Space>
        </Col>
      </Row>

      {reports.length === 0 ? (
        <Empty description="暂无报告，点击右上角生成新报告">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setGenerateModalVisible(true)}>
            生成第一份报告
          </Button>
        </Empty>
      ) : (
        <Card>
          <List
            dataSource={reports}
            renderItem={(report) => (
              <List.Item
                key={report.id}
                actions={[
                  <Button
                    size="small"
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      setSelectedReport(report);
                      setDetailVisible(true);
                    }}
                  >
                    查看详情
                  </Button>,
                  <Button
                    size="small"
                    type="link"
                    icon={<ShareAltOutlined />}
                    onClick={() => handleShare(report.id)}
                  >
                    分享
                  </Button>,
                  <Button
                    size="small"
                    type="link"
                    icon={<DownloadOutlined />}
                    onClick={() => handleExport(report)}
                  >
                    导出
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<FileTextOutlined style={{ fontSize: 32, color: '#1890ff' }} />}
                  title={
                    <Space>
                      <Tag color={getReportTypeColor(report.type)}>{getReportTypeText(report.type)}</Tag>
                      <Text strong>{report.title}</Text>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <div>
                        <Text type="secondary">综合评分：</Text>
                        <Progress
                          percent={report.overallScore}
                          size="small"
                          style={{ width: 200, display: 'inline-block', marginLeft: 8 }}
                          strokeColor={
                            report.overallScore >= 80 ? '#52c41a' :
                            report.overallScore >= 60 ? '#1890ff' : '#fa8c16'
                          }
                        />
                        <Text strong style={{ marginLeft: 8 }}>{report.overallScore}分</Text>
                      </div>
                      <Text type="secondary">
                        生成时间：{new Date(report.generatedAt).toLocaleString()}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}

      <Modal
        title="报告详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>关闭</Button>,
          <Button key="export" type="primary" onClick={() => selectedReport && handleExport(selectedReport)}>
            导出报告
          </Button>,
        ]}
        width={700}
      >
        {selectedReport && (
          <div>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card size="small" title="学情概览">
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="知识点总数"
                      value={selectedReport.content?.overview?.totalKnowledgePoints || 0}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="已掌握"
                      value={selectedReport.content?.overview?.masteredCount || 0}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="薄弱点"
                      value={selectedReport.content?.overview?.weakPointsCount || 0}
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Col>
                </Row>
              </Card>

              <Card size="small" title="学习建议">
                <ul>
                  {(selectedReport.content?.suggestions || []).map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </Card>
            </Space>
          </div>
        )}
      </Modal>

      <Modal
        title="生成报告"
        open={generateModalVisible}
        onCancel={() => setGenerateModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setGenerateModalVisible(false)}>取消</Button>,
          <Button key="generate" type="primary" onClick={handleGenerate}>生成</Button>,
        ]}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong>报告类型</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={generateForm.type}
              onChange={(v) => setGenerateForm(prev => ({ ...prev, type: v }))}
            >
              <Option value="student_personal">个人诊断报告</Option>
              <Option value="student_period">阶段性学习报告</Option>
              <Option value="diagnosis">诊断测试报告</Option>
            </Select>
          </div>
          <div>
            <Text strong>学科</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={generateForm.subjectId}
              onChange={(v) => setGenerateForm(prev => ({ ...prev, subjectId: v }))}
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
