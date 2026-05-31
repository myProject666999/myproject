import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Button, Space, Typography, Progress, Empty, Spin, Row, Col, Modal, message, Statistic } from 'antd';
import { PlayCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, ReloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { recommendationApi } from '../services';
import type { Recommendation } from '../types';

const { Title, Text, Paragraph } = Typography;

export default function RecommendationsPage() {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [result, statistics] = await Promise.all([
        recommendationApi.getMyRecommendations(),
        recommendationApi.getStatistics(),
      ]);
      setRecommendations(result.list || []);
      setStats(statistics);
    } catch (error) {
      console.error('加载推荐练习失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      message.loading('正在生成推荐练习...', 0);
      await recommendationApi.generate();
      message.success('推荐练习已生成');
      loadData();
    } catch (error: any) {
      message.error(error || '生成失败');
    } finally {
      message.destroy();
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await recommendationApi.complete(id);
      message.success('练习已完成');
      loadData();
    } catch (error: any) {
      message.error(error || '操作失败');
    }
  };

  const getRecTypeText = (type: string) => {
    const texts: Record<string, string> = {
      weak_point: '薄弱点专项',
      forgetting: '遗忘复习',
      preview: '预习内容',
      comprehensive: '综合练习',
    };
    return texts[type] || type;
  };

  const getRecTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      weak_point: 'red',
      forgetting: 'orange',
      preview: 'green',
      comprehensive: 'blue',
    };
    return colors[type] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'blue',
      in_progress: 'orange',
      completed: 'green',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: '待完成',
      in_progress: '进行中',
      completed: '已完成',
    };
    return texts[status] || status;
  };

  if (loading) return <Spin size="large" style={{ display: 'block', textAlign: 'center', marginTop: 100 }} />;

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>推荐练习</Title>
        </Col>
        <Col>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
            <Button type="primary" onClick={handleGenerate}>生成新推荐</Button>
          </Space>
        </Col>
      </Row>

      {stats && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={8}>
            <Card size="small">
              <Statistic
                title="总推荐"
                value={stats.total || 0}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={8}>
            <Card size="small">
              <Statistic
                title="已完成"
                value={stats.completed || 0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={8}>
            <Card size="small">
              <Statistic
                title="完成率"
                value={stats.completionRate ? Math.round(stats.completionRate) : 0}
                suffix="%"
                prefix={<Progress type="circle" percent={stats.completionRate || 0} size={40} />}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        {recommendations.length === 0 ? (
          <Empty description="暂无推荐练习，点击右上角生成新推荐">
            <Button type="primary" onClick={handleGenerate}>生成推荐</Button>
          </Empty>
        ) : (
          <List
            dataSource={recommendations}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                actions={[
                  item.status === 'completed' ? (
                    <Tag color="green">已完成 {item.score} 分</Tag>
                  ) : (
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlayCircleOutlined />}
                      onClick={() => {
                        setSelectedRec(item);
                        setModalVisible(true);
                      }}
                    >
                      开始练习
                    </Button>
                  ),
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Tag color={getRecTypeColor(item.type)}>
                        {getRecTypeText(item.type)}
                      </Tag>
                      <Tag color={getStatusColor(item.status)}>
                        {getStatusText(item.status)}
                      </Tag>
                      <Text strong>{item.title}</Text>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Text type="secondary">{item.description}</Text>
                      <Text type="secondary">
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {item.questionCount} 题 · 约 {item.estimatedTime} 分钟
                      </Text>
                      <Text type="secondary" style={{ color: '#fa8c16' }}>
                        💡 推荐理由：{item.reason}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      <Modal
        title="练习详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={600}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>取消</Button>,
          <Button
            key="complete"
            type="primary"
            onClick={() => {
              if (selectedRec) {
                handleComplete(selectedRec.id);
                setModalVisible(false);
              }
            }}
          >
            完成练习
          </Button>,
        ]}
      >
        {selectedRec && (
          <div>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>练习名称：</Text>
                <Text>{selectedRec.title}</Text>
              </div>
              <div>
                <Text strong>练习类型：</Text>
                <Tag color={getRecTypeColor(selectedRec.type)}>
                  {getRecTypeText(selectedRec.type)}
                </Tag>
              </div>
              <div>
                <Text strong>题目数量：</Text>
                <Text>{selectedRec.questionCount} 题</Text>
              </div>
              <div>
                <Text strong>预计时间：</Text>
                <Text>{selectedRec.estimatedTime} 分钟</Text>
              </div>
              <div>
                <Text strong>推荐理由：</Text>
                <Paragraph style={{ marginTop: 8 }}>{selectedRec.reason}</Paragraph>
              </div>
              <div>
                <Text strong>练习说明：</Text>
                <Paragraph>{selectedRec.description}</Paragraph>
              </div>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
}
