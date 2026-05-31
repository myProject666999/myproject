import React, { useState, useEffect } from 'react';
import { Card, Table, Progress, Tag, Typography, Space, Tooltip, Button, Statistic, Row, Col, Empty } from 'antd';
import { ArrowUpOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { weakPointApi, masteryApi } from '../services';
import type { WeakPoint, KnowledgeMastery } from '../types';
import { Line } from '@ant-design/charts';

const { Title, Text } = Typography;

export default function MasteryPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weakPoints, setWeakPoints] = useState<WeakPoint[]>([]);
  const [masteryData, setMasteryData] = useState<KnowledgeMastery[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [weak, mastery, statistics] = await Promise.all([
        weakPointApi.getMyWeakPoints(),
        masteryApi.getMyMastery(),
        weakPointApi.getStatistics(),
      ]);
      setWeakPoints(weak);
      setMasteryData(mastery);
      setStats(statistics);
    } catch (error) {
      console.error('加载数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (level: string) => {
    const colors: Record<string, string> = {
      critical: 'red',
      high: 'orange',
      medium: 'gold',
      low: 'blue',
    };
    return colors[level] || 'default';
  };

  const getSeverityText = (level: string) => {
    const texts: Record<string, string> = {
      critical: '严重',
      high: '较高',
      medium: '中等',
      low: '轻微',
    };
    return texts[level] || level;
  };

  const getMasteryColor = (level: number) => {
    if (level >= 80) return '#52c41a';
    if (level >= 60) return '#1890ff';
    if (level >= 40) return '#faad14';
    return '#ff4d4f';
  };

  const weakColumns = [
    {
      title: '知识点',
      dataIndex: ['knowledgePoint', 'name'],
      key: 'name',
      render: (text: string, record: WeakPoint) => (
        <Space>
          <Text strong>{text || record.knowledgePointId}</Text>
        </Space>
      ),
    },
    {
      title: '薄弱程度',
      dataIndex: 'severityLevel',
      key: 'severity',
      render: (level: string) => (
        <Tag color={getSeverityColor(level)}>{getSeverityText(level)}</Tag>
      ),
    },
    {
      title: '错误率',
      dataIndex: 'errorRate',
      key: 'errorRate',
      render: (rate: number) => `${Math.round(rate * 100)}%`,
    },
    {
      title: '原因分析',
      dataIndex: 'reasonAnalysis',
      key: 'reason',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <Text type="secondary">{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: '检测时间',
      dataIndex: 'detectedAt',
      key: 'detectedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const masteryColumns = [
    {
      title: '知识点',
      dataIndex: 'knowledgePointName',
      key: 'name',
    },
    {
      title: '掌握度',
      dataIndex: 'masteryLevel',
      key: 'mastery',
      render: (level: number) => (
        <Progress
          percent={Math.round(level)}
          strokeColor={getMasteryColor(level)}
          size="small"
          style={{ width: 150 }}
        />
      ),
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (c: number) => `${Math.round(c * 100)}%`,
    },
    {
      title: '练习次数',
      dataIndex: 'totalAttempts',
      key: 'attempts',
    },
    {
      title: '正确率',
      key: 'correctRate',
      render: (_: any, record: KnowledgeMastery) =>
        record.totalAttempts > 0
          ? `${Math.round((record.correctAttempts / record.totalAttempts) * 100)}%`
          : '-',
    },
    {
      title: '遗忘曲线',
      dataIndex: 'forgettingCurve',
      key: 'forgetting',
      render: (f: number) => `${Math.round(f * 100)}%`,
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>掌握度诊断</Title>
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} onClick={loadData}>刷新数据</Button>
        </Col>
      </Row>

      {stats && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="总薄弱点"
                value={stats.total || 0}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="严重薄弱"
                value={stats.critical || 0}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<ArrowUpOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="较高薄弱"
                value={stats.high || 0}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="已改善"
                value={stats.improved || 0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<ArrowUpOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card
        title={
          <Space>
            薄弱知识点
            <Tooltip title="综合掌握度、错误率、知识点重要性等因素自动检测">
              <InfoCircleOutlined style={{ color: '#999' }} />
            </Tooltip>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        {weakPoints.length === 0 ? (
          <Empty description="暂无薄弱点，继续保持！" />
        ) : (
          <Table
            dataSource={weakPoints}
            columns={weakColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
            size="small"
          />
        )}
      </Card>

      <Card title="知识点掌握度详情">
        <Table
          dataSource={masteryData.map((m) => ({
            ...m,
            key: m.id,
            knowledgePointName: (m as any).knowledgePoint?.name || '未知知识点',
          }))}
          columns={masteryColumns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>
    </div>
  );
}
