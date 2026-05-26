import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { EyeOutlined, ThunderboltOutlined, RiseOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import { adStatApi } from '../services/api';

const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<any>({});
  const [statsData, setStatsData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [summaryRes, statsRes] = await Promise.all([
        adStatApi.getSummary(),
        adStatApi.getAll(),
      ]);
      setSummary(summaryRes.data);
      setStatsData(statsRes.data || []);
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const chartData = statsData.reduce((acc: any[], item) => {
    const date = item.statDate;
    const existing = acc.find((d) => d.date === date);
    if (existing) {
      existing.impressions += item.impressions;
      existing.clicks += item.clicks;
    } else {
      acc.push({
        date,
        impressions: item.impressions,
        clicks: item.clicks,
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const lineConfig = {
    data: chartData,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 5000,
      },
    },
  };

  const lineData = [
    ...chartData.map((d) => ({ date: d.date, value: d.impressions, type: '曝光量' })),
    ...chartData.map((d) => ({ date: d.date, value: d.clicks, type: '点击量' })),
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>数据概览</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总曝光量"
              value={summary.totalImpressions || 0}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="总点击量"
              value={summary.totalClicks || 0}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="平均点击率 (CTR)"
              value={((summary.avgCtr || 0) * 100).toFixed(2)}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="趋势分析" style={{ marginTop: 24 }}>
        <Line {...lineConfig} data={lineData} />
      </Card>
    </div>
  );
};

export default DashboardPage;
