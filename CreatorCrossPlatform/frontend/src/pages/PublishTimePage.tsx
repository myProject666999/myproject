import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Clock, Star, BarChart3 } from 'lucide-react';
import { getPublishTimeAnalysis } from '@/utils/api';
import type { PublishTimeAnalysis, HourAnalysis } from '@/types';
import { cn } from '@/lib/utils';

const PLATFORM_BADGES: Record<string, string> = {
  DOUYIN: 'badge-douyin',
  BILIBILI: 'badge-bilibili',
  XIAOHONGSHU: 'badge-xiaohongshu',
};

export default function PublishTimePage() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PublishTimeAnalysis | null>(null);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const data = await getPublishTimeAnalysis(1);
      setAnalysis(data);
    } catch (error) {
      console.error('Failed to fetch publish time analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const topHours = analysis?.hourAnalysis && analysis.hourAnalysis.length > 0
    ? [...analysis.hourAnalysis].sort((a, b) => b.score - a.score).slice(0, 3)
    : [];

  const hasData = analysis?.hourAnalysis && analysis.hourAnalysis.length > 0;

  const safeNumber = (num: number | undefined | null, defaultValue: number = 0) => {
    return num ?? defaultValue;
  };

  const formatScore = (score: number | undefined | null) => {
    const s = safeNumber(score);
    return s.toFixed(1);
  };

  const isTopHour = (hour: number) => topHours.some((h) => h.publishHour === hour);

  const formatHour = (hour: number) => `${hour.toString().padStart(2, '0')}:00`;

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}w`;
    }
    return num.toLocaleString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-indigo-400" />
          <h1 className="text-2xl font-bold">发布时间分析</h1>
          {analysis && (
            <span className={cn('badge', PLATFORM_BADGES[analysis.platformCode] || 'badge')}>
              {analysis.platformName}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : hasData ? (
        <>
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold">24小时发布效果分布</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.hourAnalysis} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="publishHour"
                    stroke="#64748B"
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                    tickFormatter={(value) => formatHour(value)}
                  />
                  <YAxis
                    stroke="#64748B"
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                    label={{ value: '综合评分', angle: -90, position: 'insideLeft', fill: '#94A3B8' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#E2E8F0' }}
                    labelFormatter={(value) => `${formatHour(value as number)}`}
                    formatter={(value: number, name: string) => [
                      value.toFixed(2),
                      name === 'score' ? '综合评分' : name,
                    ]}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {analysis.hourAnalysis.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={isTopHour(entry.publishHour) ? '#8B5CF6' : '#6366F1'}
                        fillOpacity={isTopHour(entry.publishHour) ? 1 : 0.6}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-semibold">最佳发布时间推荐</h2>
              </div>
              <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl p-6 border border-indigo-500/30">
                <div className="text-center mb-4">
                    <div className="text-5xl font-bold gradient-text mb-2">
                      {formatHour(safeNumber(analysis.bestPublishHour))}
                    </div>
                    <div className="text-[#94A3B8]">推荐发布时段</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {formatScore(analysis.bestHourScore)}
                      </div>
                      <div className="text-xs text-[#64748B]">综合评分</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {formatNumber(safeNumber(analysis.bestHourAvgViews))}
                      </div>
                      <div className="text-xs text-[#64748B]">平均播放</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {safeNumber(analysis.bestHourContentCount)}
                      </div>
                      <div className="text-xs text-[#64748B]">作品数量</div>
                    </div>
                  </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-semibold">TOP 3 黄金时段</h2>
              </div>
              <div className="space-y-3">
                {topHours.map((hour, index) => (
                  <div
                    key={hour.publishHour}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#334155]/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                          index === 0
                            ? 'bg-yellow-500 text-black'
                            : index === 1
                            ? 'bg-gray-400 text-black'
                            : 'bg-amber-600 text-black'
                        )}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{formatHour(hour.publishHour)}</div>
                        <div className="text-xs text-[#64748B]">
                          {hour.contentCount} 个作品
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-indigo-400">
                          {formatScore(hour.score)} 分
                        </div>
                        <div className="text-xs text-[#64748B]">
                          {formatNumber(safeNumber(hour.avgViews))} 播放
                        </div>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold">时段详情</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#334155]">
                    <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">时段</th>
                    <th className="text-right py-3 px-4 text-[#94A3B8] font-medium">作品数</th>
                    <th className="text-right py-3 px-4 text-[#94A3B8] font-medium">平均播放</th>
                    <th className="text-right py-3 px-4 text-[#94A3B8] font-medium">平均点赞</th>
                    <th className="text-right py-3 px-4 text-[#94A3B8] font-medium">互动率</th>
                    <th className="text-right py-3 px-4 text-[#94A3B8] font-medium">综合评分</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.hourAnalysis.map((hour) => (
                    <tr
                      key={hour.publishHour}
                      className={cn(
                        'border-b border-[#334155]/50 transition-colors',
                        isTopHour(hour.publishHour)
                          ? 'bg-indigo-500/10'
                          : 'hover:bg-[#334155]/30'
                      )}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {isTopHour(hour.publishHour) && (
                            <Star className="w-4 h-4 text-yellow-400" />
                          )}
                          <span className={isTopHour(hour.publishHour) ? 'font-semibold' : ''}>
                            {formatHour(hour.publishHour)}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">{hour.contentCount}</td>
                      <td className="text-right py-3 px-4">{formatNumber(safeNumber(hour.avgViews))}</td>
                      <td className="text-right py-3 px-4">{formatNumber(safeNumber(hour.avgLikes))}</td>
                      <td className="text-right py-3 px-4">
                        {(safeNumber(hour.avgEngagementRate) * 100).toFixed(2)}%
                      </td>
                      <td className="text-right py-3 px-4">
                        <span
                          className={cn(
                            'font-semibold',
                            isTopHour(hour.publishHour)
                              ? 'text-indigo-400'
                              : 'text-[#E2E8F0]'
                          )}
                        >
                          {formatScore(hour.score)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card flex flex-col items-center justify-center h-96 gap-4">
          <BarChart3 className="w-16 h-16 text-[#334155]" />
          <div className="text-[#64748B] text-lg">暂无发布时段分析数据</div>
          <div className="text-[#475569] text-sm">请点击下方按钮生成分析数据</div>
          <button
            onClick={async () => {
              try {
                const { generateAnalysis } = await import("@/utils/api");
                await generateAnalysis(1);
                fetchAnalysis();
                alert("分析数据生成成功！");
              } catch (e) {
                console.error("生成失败:", e);
                alert("生成失败，请稍后重试。");
              }
            }}
            className="btn-primary flex items-center gap-2 mt-2"
          >
            <Star className="w-4 h-4" />
            生成发布时段分析
          </button>
        </div>
      )}
    </div>
  );
}
