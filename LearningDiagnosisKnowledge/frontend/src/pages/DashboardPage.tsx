import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, List, Tag, Empty, Spin, Typography } from 'antd';
import { BookOutlined, CheckCircleOutlined, WarningOutlined, BulbOutlined, TrophyOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { subjectApi, masteryApi, weakPointApi, recommendationApi } from '../services';
import type { Subject, KnowledgeMastery, WeakPoint, Recommendation } from '../types';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [masteryData, setMasteryData] = useState<KnowledgeMastery[]>([]);
  const [weakPoints, setWeakPoints] = useState<WeakPoint[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subs, mastery, weak, rec] = await Promise.all([
        subjectApi.getList(),
        masteryApi.getMyMastery(),
        weakPointApi.getMyWeakPoints(),
        recommendationApi.getMyRecommendations().then(r => r.list),
      ]);
      setSubjects(subs);
      setMasteryData(mastery);
      setWeakPoints(weak);
      setRecommendations(rec);
    } catch (error) {
      console.error('加载数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  const avgMastery = masteryData.length > 0
    ? Math.round(masteryData.reduce((s, m) => s + m.masteryLevel, 0) / masteryData.length)
    : 0;

  const masteredCount = masteryData.filter(m => m.masteryLevel >= 80).length;

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

  if (loading) return <Spin size="large" style={{ display: 'block', textAlign: 'center', marginTop: 100 }} />;

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        👋 欢迎回来，{user?.realName}
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="知识点总数"
              value={masteryData.length}
              prefix={<BookOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已掌握"
              value={masteredCount}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="薄弱知识点"
              value={weakPoints.length}
              prefix={<WarningOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: weakPoints.length > 0 ? '#fa8c16' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text type="secondary">平均掌握度</Text>
                <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>{avgMastery}%</div>
              </div>
              <Progress
                type="circle"
                percent={avgMastery}
                width={60}
                strokeColor={avgMastery >= 80 ? '#52c41a' : avgMastery >= 60 ? '#1890ff' : '#fa8c16'}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <WarningOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
                薄弱知识点
              </span>
            }
            extra={<Link to="/weak-points">查看全部</Link>}
          >
            {weakPoints.length === 0 ? (
              <Empty description="暂无薄弱点，继续保持！" />
            ) : (
              <List
                dataSource={weakPoints.slice(0, 5)}
                renderItem={(item) => (
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      title={item.knowledgePoint?.name || item.knowledgePointId}
                      description={
                        <span>
                          <Tag color={getSeverityColor(item.severityLevel)}>
                            {getSeverityText(item.severityLevel)}
                          </Tag>
                          <Text type="secondary" style={{ marginLeft: 8 }}>
                            错误率: {Math.round(item.errorRate * 100)}%
                          </Text>
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <BulbOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                推荐练习
              </span>
            }
            extra={<Link to="/recommendations">查看全部</Link>}
          >
            {recommendations.length === 0 ? (
              <Empty description="暂无推荐练习" />
            ) : (
              <List
                dataSource={recommendations.slice(0, 5)}
                renderItem={(item) => (
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      title={
                        <span>
                          <Tag color={getRecTypeColor(item.type)}>
                            {getRecTypeText(item.type)}
                          </Tag>
                          {item.title}
                        </span>
                      }
                      description={
                        <Text type="secondary">
                          {item.questionCount} 题 · 约 {item.estimatedTime} 分钟
                        </Text>
                      }
                    />
                    <Link to={`/recommendations/${item.id}`}>开始练习</Link>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
