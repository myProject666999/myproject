import React, { useState, useEffect, useRef } from 'react';
import { Card, Select, Spin, Empty, Typography, Row, Col, Progress, Tooltip, Tag, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import type { Subject, KnowledgePoint, KnowledgeMastery } from '../types';
import { subjectApi, knowledgeApi, masteryApi } from '../services';
import type Graph from '@antv/g6';

const { Title, Text } = Typography;
const { Option } = Select;

export default function KnowledgeGraphPage() {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [knowledgeTree, setKnowledgeTree] = useState<KnowledgePoint[]>([]);
  const [masteryMap, setMasteryMap] = useState<Record<string, KnowledgeMastery>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadGraphData();
    }
  }, [selectedSubject]);

  const loadSubjects = async () => {
    try {
      const subs = await subjectApi.getList();
      setSubjects(subs);
      if (subs.length > 0) {
        setSelectedSubject(subs[0].id);
      }
    } catch (error) {
      console.error('加载学科失败', error);
    }
  };

  const loadGraphData = async () => {
    if (!selectedSubject) return;
    setLoading(true);
    try {
      const [tree, mastery] = await Promise.all([
        knowledgeApi.getTree(selectedSubject),
        masteryApi.getSubjectMastery(selectedSubject),
      ]);
      setKnowledgeTree(tree);
      const map: Record<string, KnowledgeMastery> = {};
      mastery.forEach((m: any) => {
        if (m.knowledgePoint) {
          map[m.knowledgePoint.id] = m;
        } else {
          map[m.knowledgePointId] = m;
        }
      });
      setMasteryMap(map);
      renderG6Graph(tree, map);
    } catch (error) {
      console.error('加载图谱数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  const renderG6Graph = async (tree: KnowledgePoint[], mastery: Record<string, KnowledgeMastery>) => {
    if (!containerRef.current) return;

    if (graphRef.current) {
      graphRef.current.destroy();
    }

    const G6 = await import('@antv/g6');

    const nodes: any[] = [];
    const edges: any[] = [];

    const flattenTree = (items: KnowledgePoint[]) => {
      items.forEach((item) => {
        const m = mastery[item.id];
        const masteryLevel = m?.masteryLevel || 0;
        let color = '#999';
        if (masteryLevel >= 80) color = '#52c41a';
        else if (masteryLevel >= 60) color = '#1890ff';
        else if (masteryLevel >= 40) color = '#faad14';
        else if (masteryLevel > 0) color = '#ff4d4f';

        nodes.push({
          id: item.id,
          label: item.name,
          masteryLevel,
          importanceLevel: item.importanceLevel,
          style: {
            fill: color,
            stroke: color,
          },
        });

        if (item.parentId) {
          edges.push({
            source: item.parentId,
            target: item.id,
            type: 'sub',
          });
        }

        if (item.children && item.children.length > 0) {
          flattenTree(item.children);
        }
      });
    };

    flattenTree(tree);

    const container = containerRef.current;
    const width = container.offsetWidth;
    const height = Math.max(500, container.offsetHeight);

    const graph = new G6.Graph({
      container: containerRef.current,
      width,
      height,
      layout: {
        type: 'compactBox',
        direction: 'LR',
        getId: function getId(d: any) {
          return d.id;
        },
        getHeight: () => 32,
        getWidth: () => 150,
        getVGap: () => 16,
        getHGap: () => 40,
      },
      defaultNode: {
        type: 'round-rect',
        size: [120, 32],
        labelCfg: {
          style: {
            fill: '#fff',
            fontSize: 12,
          },
        },
      },
      defaultEdge: {
        type: 'cubic-horizontal',
        style: {
          stroke: '#b8c3d9',
          lineWidth: 2,
        },
      },
      modes: {
        default: ['drag-canvas', 'zoom-canvas', 'drag-node'],
      },
    });

    graph.data({ nodes, edges });
    graph.render();
    graph.fitView();

    graphRef.current = graph;
  };

  const getMasteryColor = (level: number) => {
    if (level >= 80) return '#52c41a';
    if (level >= 60) return '#1890ff';
    if (level >= 40) return '#faad14';
    return '#ff4d4f';
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>知识图谱</Title>
        </Col>
        <Col>
          <Space>
            <Select
              style={{ width: 150 }}
              placeholder="选择学科"
              value={selectedSubject}
              onChange={setSelectedSubject}
            >
              {subjects.map((s) => (
                <Option key={s.id} value={s.id}>{s.name}</Option>
              ))}
            </Select>
            <Tag color="green">已掌握 ≥80%</Tag>
            <Tag color="blue">较好 60-80%</Tag>
            <Tag color="orange">一般 40-60%</Tag>
            <Tag color="red">薄弱 {'<'}40%</Tag>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="知识点掌握情况" size="small">
            {loading ? <Spin /> : (
              <div style={{ maxHeight: 450, overflow: 'auto' }}>
                {knowledgeTree.map((kp) => (
                  <div key={kp.id} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                      <Text strong>{kp.name}</Text>
                      <Tooltip title={kp.description}>
                        <InfoCircleOutlined style={{ color: '#999', marginLeft: 4 }} />
                      </Tooltip>
                    </div>
                    {masteryMap[kp.id] ? (
                      <Progress
                        percent={Math.round(masteryMap[kp.id].masteryLevel)}
                        strokeColor={getMasteryColor(masteryMap[kp.id].masteryLevel)}
                        size="small"
                      />
                    ) : (
                      <Progress percent={0} strokeColor="#d9d9d9" size="small" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title="知识图谱可视化"
            size="small"
            extra={<Text type="secondary">可拖拽缩放</Text>}
            style={{ height: '100%' }}
          >
            {loading ? (
              <div style={{ height: 450, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin size="large" />
              </div>
            ) : knowledgeTree.length === 0 ? (
              <div style={{ height: 450, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty description="暂无知识点数据" />
              </div>
            ) : (
              <div ref={containerRef} style={{ width: '100%', height: 450 }} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
