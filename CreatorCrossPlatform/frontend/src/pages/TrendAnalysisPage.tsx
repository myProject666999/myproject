import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown, LineChart as LineChartIcon } from 'lucide-react';
import dayjs from 'dayjs';
import { getFansTrend, getViewsTrend, getEngagementTrend } from '@/utils/api';
import type { TrendData } from '@/types';
import { cn } from '@/lib/utils';

const PLATFORM_COLORS: Record<string, string> = {
  DOUYIN: '#EC4899',
  BILIBILI: '#06B6D4',
  XIAOHONGSHU: '#EF4444',
};

const PLATFORM_NAMES: Record<string, string> = {
  DOUYIN: '抖音',
  BILIBILI: 'B站',
  XIAOHONGSHU: '小红书',
};

type TabType = 'fans' | 'views' | 'engagement';

interface PlatformTrendData {
  date: string;
  [key: string]: number | string;
}

export default function TrendAnalysisPage() {
  const [activeTab, setActiveTab] = useState<TabType>('fans');
  const [loading, setLoading] = useState(false);
  const [trendData, setTrendData] = useState<Record<string, TrendData[]>>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['DOUYIN', 'BILIBILI', 'XIAOHONGSHU']);
  const [startDate, setStartDate] = useState(dayjs().subtract(6, 'day').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));

  const tabs = [
    { key: 'fans' as TabType, label: '粉丝趋势', icon: TrendingUp },
    { key: 'views' as TabType, label: '播放趋势', icon: TrendingUp },
    { key: 'engagement' as TabType, label: '互动趋势', icon: TrendingDown },
  ];

  const fetchTrendData = async () => {
    setLoading(true);
    try {
      const params = {
        creatorId: 1,
        startDate,
        endDate,
      };

      let data: Record<string, TrendData[]>;
      switch (activeTab) {
        case 'fans':
          data = await getFansTrend(params);
          break;
        case 'views':
          data = await getViewsTrend(params);
          break;
        case 'engagement':
          data = await getEngagementTrend(params);
          break;
      }
      setTrendData(data);
    } catch (error) {
      console.error('Failed to fetch trend data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendData();
  }, [activeTab, startDate, endDate]);

  const chartData = useMemo(() => {
    if (!trendData || Object.keys(trendData).length === 0) return [];

    const allDates = new Set<string>();
    Object.values(trendData).forEach((platformData) => {
      platformData.forEach((item) => allDates.add(item.date));
    });

    const sortedDates = Array.from(allDates).sort();

    return sortedDates.map((date) => {
      const row: PlatformTrendData = { date };
      Object.entries(trendData).forEach(([platform, data]) => {
        const item = data.find((d) => d.date === date);
        row[platform] = item?.value || 0;
      });
      return row;
    });
  }, [trendData]);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleDateRangeChange = (days: number) => {
    setEndDate(dayjs().format('YYYY-MM-DD'));
    setStartDate(dayjs().subtract(days - 1, 'day').format('YYYY-MM-DD'));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LineChartIcon className="w-8 h-8 text-indigo-400" />
          <h1 className="text-2xl font-bold">趋势分析</h1>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                  activeTab === tab.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#334155] text-[#94A3B8] hover:bg-[#475569]'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#94A3B8]" />
              <select
                value={endDate === dayjs().format('YYYY-MM-DD') && startDate === dayjs().subtract(6, 'day').format('YYYY-MM-DD') ? '7' : endDate === dayjs().format('YYYY-MM-DD') && startDate === dayjs().subtract(29, 'day').format('YYYY-MM-DD') ? '30' : endDate === dayjs().format('YYYY-MM-DD') && startDate === dayjs().subtract(89, 'day').format('YYYY-MM-DD') ? '90' : 'custom'}
                onChange={(e) => handleDateRangeChange(Number(e.target.value))}
                className="bg-[#334155] border border-[#475569] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="7">最近7天</option>
                <option value="30">最近30天</option>
                <option value="90">最近90天</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          {Object.entries(PLATFORM_NAMES).map(([code, name]) => (
            <button
              key={code}
              onClick={() => togglePlatform(code)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
                selectedPlatforms.includes(code)
                  ? 'border-opacity-100'
                  : 'border-[#475569] bg-[#1E293B] text-[#64748B] opacity-50'
              )}
              style={{
                borderColor: selectedPlatforms.includes(code) ? PLATFORM_COLORS[code] : undefined,
                backgroundColor: selectedPlatforms.includes(code) ? `${PLATFORM_COLORS[code]}20` : undefined,
                color: selectedPlatforms.includes(code) ? PLATFORM_COLORS[code] : undefined,
              }}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: PLATFORM_COLORS[code] }}
              />
              {name}
            </button>
          ))}
        </div>

        <div className="h-96">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  tickFormatter={(value) => dayjs(value).format('MM-DD')}
                />
                <YAxis
                  stroke="#64748B"
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#E2E8F0' }}
                  labelFormatter={(value) => dayjs(value as string).format('YYYY-MM-DD')}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: '#E2E8F0' }}>{PLATFORM_NAMES[value] || value}</span>
                  )}
                />
                {selectedPlatforms.map((platform) => (
                  <Line
                    key={platform}
                    type="monotone"
                    dataKey={platform}
                    stroke={PLATFORM_COLORS[platform]}
                    strokeWidth={2}
                    dot={{ fill: PLATFORM_COLORS[platform], strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
