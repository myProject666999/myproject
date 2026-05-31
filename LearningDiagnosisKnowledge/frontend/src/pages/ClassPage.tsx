import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Typography, Tag, Select, Empty, Spin, Statistic, Row, Col, Progress, Tooltip, Modal, message } from 'antd';
import { TeamOutlined, BarChartOutlined, FileTextOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { Column } from '@ant-design/charts';
import { useAuth } from '../contexts/AuthContext';
import { classApi, reportApi, exportApi } from '../services';
import type { ClassEntity, LearningReport } from '../types';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function ClassPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [statistics, setStatistics] = useState<any>(null);
  const [reports, setReports] = useState<LearningReport[]>([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<LearningReport | null>(null);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadClassData();
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const result = await classApi.getMyClasses();
      setClasses(result);
      if (result.length > 0) {
        setSelectedClass(result[0].id);
      }
    } catch (error) {
      console.error('加载班级列表失败', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClassData = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const [stats, reportsResult] = await Promise.all([
        classApi.getStatistics(selectedClass),
        reportApi.getMyReports(),
      ]);
      setStatistics(stats);
      setReports(reportsResult.list || []);
    } catch (error) {
      console.error('加载班级数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      await reportApi.generate({
        type: 'class_overall',
        classId: selectedClass,
      });
      message.success('报告生成成功');
      loadClassData();
    } catch (error: any) {
      message.error(error || '生成报告失败');
    }
  };

  const handleViewReport = async (report: LearningReport) => {
    try {
      const detail = await reportApi.get(report.id);
      setSelectedReport(detail);
      setDetailVisible(true);
    } catch (error: any) {
      message.error(error || '获取报告详情失败');
    }
  };

  const handleExportReport = async (report: LearningReport) => {
    try {
      const params: any = {
        type: 'class_report',
        format: 'pdf',
        classId: Number(selectedClass),
        subjectId: report.subjectId ? Number(report.subjectId) : undefined,
      };
      await exportApi.create(params);
      message.success('导出任务已创建');
    } catch (error: any) {
      message.error(error || '导出失败');
    }
  };

  const rankingColumns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => {
        if (rank === 1) return <Tag color="gold">🥇 第1名</Tag>;
        if (rank === 2) return <Tag color="silver">🥈 第2名</Tag>;
        if (rank === 3) return <Tag color="bronze">🥉 第3名</Tag>;
        return `第${rank}名`;
      },
    },
    {
      title: '学生',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: '掌握度',
      dataIndex: 'masteryLevel',
      key: 'mastery',
      render: (level: number) => (
        <Progress percent={Math.round(level)} size="small" style={{ width: 120 }} />
      ),
    },
    {
      title: '正确率',
      dataIndex: 'correctRate',
      key: 'correctRate',
      render: (rate: number) => `${Math.round(rate * 100)}%`,
    },
  ];

  const masteryDistributionConfig = statistics?.masteryDistribution ? {
    data: Object.entries(statistics.masteryDistribution).map(([range, count]) => ({
      range,
      count,
    })),
    xField: 'range',
    yField: 'count',
    color: ['#52c41a', '#1890ff', '#faad14', '#ff4d4f'],
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
  } : null;

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>班级学情</Title>
        </Col>
        <Col>
          <Space>
            <Select
              style={{ width: 200 }}
              placeholder="选择班级"
              value={selectedClass}
              onChange={setSelectedClass}
            >
              {classes.map((c) => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
            <Button icon={<BarChartOutlined />} onClick={loadClassData}>刷新</Button>
          </Space>
        </Col>
      </Row>

      {loading ? (
        <Spin size="large" style={{ display: 'block', textAlign: 'center', marginTop: 100 }} />
      ) : !selectedClass ? (
        <Empty description="暂无班级数据" />
      ) : (
        <>
          {statistics && (
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="学生总数"
                    value={statistics.studentCount || 0}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="平均掌握度"
                    value={statistics.avgMastery ? Math.round(statistics.avgMastery) : 0}
                    suffix="%"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="班级薄弱点"
                    value={statistics.weakPointsCount || 0}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="答题总数"
                    value={statistics.totalAnswers || 0}
                  />
                </Card>
              </Col>
            </Row>
          )}

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="掌握度分布">
                {masteryDistributionConfig ? (
                  <Column {...masteryDistributionConfig} height={250} />
                ) : (
                  <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                title="班级学生排名"
                extra={<Tooltip title="隐私保护：学生间不可见具体分数">查看全部</Tooltip>}
              >
                <Table
                  dataSource={statistics?.studentRanking || []}
                  columns={rankingColumns}
                  rowKey="id"
                  size="small"
                  pagination={false}
                />
              </Card>
            </Col>
          </Row>

          <Card
            title="班级报告"
            style={{ marginTop: 16 }}
            extra={
              <Button type="primary" icon={<FileTextOutlined />} onClick={handleGenerateReport}>
                生成班级报告
              </Button>
            }
          >
            <Table
              dataSource={reports}
              columns={[
                { title: '报告名称', dataIndex: 'title', key: 'title' },
                {
                  title: '类型',
                  dataIndex: 'type',
                  key: 'type',
                  render: (type: string) => {
                    const texts: Record<string, string> = {
                      class_overall: '班级整体',
                      class_comparison: '班级对比',
                    };
                    return <Tag>{texts[type] || type}</Tag>;
                  },
                },
                { title: '综合评分', dataIndex: 'overallScore', key: 'score', render: (s: number) => `${s}分` },
                {
                  title: '生成时间',
                  dataIndex: 'generatedAt',
                  key: 'time',
                  render: (d: string) => new Date(d).toLocaleString(),
                },
                {
                  title: '操作',
                  key: 'actions',
                  render: (_: any, record: LearningReport) => (
                    <Space>
                      <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => handleViewReport(record)}>查看</Button>
                      <Button size="small" type="link" icon={<DownloadOutlined />} onClick={() => handleExportReport(record)}>导出</Button>
                    </Space>
                  ),
                },
              ]}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
            />
          </Card>

          <Modal
            title="报告详情"
            open={detailVisible}
            onCancel={() => setDetailVisible(false)}
            footer={[
              <Button key="close" onClick={() => setDetailVisible(false)}>关闭</Button>,
              <Button key="export" type="primary" onClick={() => selectedReport && handleExportReport(selectedReport)}>
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
        </>
      )}
    </div>
  );
}
