import React, { useEffect, useState } from 'react';
import { Table, Card, Row, Col, Statistic, DatePicker, Select, Space } from 'antd';
import { EyeOutlined, ThunderboltOutlined, RiseOutlined } from '@ant-design/icons';
import { Column } from '@ant-design/charts';
import dayjs from 'dayjs';
import { adStatApi, adScheduleApi } from '../services/api';

const { RangePicker } = DatePicker;

const AdStatsPage: React.FC = () => {
  const [summary, setSummary] = useState<any>({});
  const [statsData, setStatsData] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<any>([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ]);

  useEffect(() => {
    loadSelectData();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedSchedule, dateRange]);

  const loadSelectData = async () => {
    try {
      const res = await adScheduleApi.getAll();
      setSchedules(res.data || []);
    } catch (error) {
      console.error('加载排期数据失败:', error);
    }
  };

  const loadData = async () => {
    try {
      const params: any = {};
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }

      const summaryRes = await adStatApi.getSummary(params);
      setSummary(summaryRes.data);

      let statsRes;
      if (selectedSchedule) {
        statsRes = await adStatApi.getBySchedule(selectedSchedule, params);
      } else {
        statsRes = await adStatApi.getAll(params);
      }
      setStatsData(statsRes.data || []);
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const chartData = statsData.reduce((acc: any[], item) => {
    const date = item.statDate;
    const scheduleName = item.schedule?.name || `排期${item.scheduleId}`;
    const existing = acc.find((d) => d.date === date && d.schedule === scheduleName);
    if (existing) {
      existing.impressions += item.impressions;
      existing.clicks += item.clicks;
    } else {
      acc.push({
        date,
        schedule: scheduleName,
        impressions: item.impressions,
        clicks: item.clicks,
        ctr: item.ctr,
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const columnConfig = {
    data: chartData,
    xField: 'date',
    yField: 'impressions',
    seriesField: 'schedule',
    isGroup: true,
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
  };

  const columns = [
    { title: '日期', dataIndex: 'statDate', key: 'statDate', width: 120 },
    {
      title: '排期',
      key: 'schedule',
      render: (_: any, record: any) => record.schedule?.name || '-',
    },
    {
      title: '广告位',
      key: 'adSpace',
      render: (_: any, record: any) => record.adSpace?.name || '-',
    },
    {
      title: '素材',
      key: 'material',
      render: (_: any, record: any) => record.material?.name || '-',
    },
    {
      title: '曝光量',
      dataIndex: 'impressions',
      key: 'impressions',
      sorter: (a: any, b: any) => a.impressions - b.impressions,
    },
    {
      title: '点击量',
      dataIndex: 'clicks',
      key: 'clicks',
      sorter: (a: any, b: any) => a.clicks - b.clicks,
    },
    {
      title: 'CTR',
      key: 'ctr',
      render: (_: any, record: any) => `${((record.ctr || 0) * 100).toFixed(2)}%`,
      sorter: (a: any, b: any) => a.ctr - b.ctr,
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>统计分析</h2>

      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <span>日期范围：</span>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            format="YYYY-MM-DD"
          />
          <span>排期筛选：</span>
          <Select
            style={{ width: 200 }}
            placeholder="全部排期"
            allowClear
            value={selectedSchedule}
            onChange={setSelectedSchedule}
          >
            {schedules.map((s) => (
              <Select.Option key={s.id} value={s.id}>
                {s.name}
              </Select.Option>
            ))}
          </Select>
        </Space>
      </Card>

      <Row gutter={16} style={{ marginBottom: 24 }}>
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

      <Card title="曝光量对比" style={{ marginBottom: 24 }}>
        <Column {...columnConfig} />
      </Card>

      <Card title="详细数据">
        <Table columns={columns} dataSource={statsData} rowKey="id" />
      </Card>
    </div>
  );
};

export default AdStatsPage;
