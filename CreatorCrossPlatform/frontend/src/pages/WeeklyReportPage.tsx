import { useState, useEffect } from "react";
import { FileText, Calendar, TrendingUp, Lightbulb, Users, Eye, ThumbsUp, MessageCircle, Activity, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { generateWeeklyReport, getWeeklyReportDetail } from "@/utils/api";
import type { WeeklyReport, WeeklyTrend, PlatformWeeklyMetrics, ContentRank } from "@/types";
import { cn } from "@/lib/utils";

const PLATFORM_BADGE_MAP: Record<string, string> = {
  DOUYIN: "badge-douyin",
  BILIBILI: "badge-bilibili",
  XIAOHONGSHU: "badge-xiaohongshu",
};

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

function formatGrowthRate(rate: number): { text: string; className: string } {
  const formatted = (rate * 100).toFixed(1) + "%";
  if (rate >= 0) {
    return { text: "+" + formatted, className: "trend-up" };
  }
  return { text: formatted, className: "trend-down" };
}

function getPlatformBadgeClass(platformCode: string): string {
  return PLATFORM_BADGE_MAP[platformCode] || "badge bg-slate-500/20 text-slate-400";
}

function parseSuggestions(suggestions: string): string[] {
  if (!suggestions) return [];
  return suggestions.split(/[；;。\n]/).filter(s => s.trim().length > 0);
}

export default function WeeklyReportPage() {
  const [weekStart, setWeekStart] = useState<string>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split("T")[0];
  });

  const [weekEnd, setWeekEnd] = useState<string>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) + 6;
    const sunday = new Date(now.setDate(diff));
    return sunday.toISOString().split("T")[0];
  });

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<WeeklyReport | null>(null);

  const creatorId = 1;

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    setLoading(true);
    try {
      const data = await getWeeklyReportDetail({
        creatorId,
        weekDate: weekStart,
      });
      setReport(data);
    } catch (error) {
      console.error("Failed to load weekly report:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateReport() {
    setGenerating(true);
    try {
      const data = await generateWeeklyReport({
        creatorId,
        weekStart,
        weekEnd,
      });
      setReport(data);
    } catch (error) {
      console.error("Failed to generate weekly report:", error);
    } finally {
      setGenerating(false);
    }
  }

  const metrics = report ? [
    { label: "总粉丝数", value: report.totalFans, icon: Users, color: "text-blue-400" },
    { label: "净增粉丝", value: report.weeklyNetFans, icon: TrendingUp, color: "text-emerald-400" },
    { label: "总播放量", value: report.weeklyViews, icon: Eye, color: "text-purple-400" },
    { label: "总点赞量", value: report.weeklyLikes, icon: ThumbsUp, color: "text-pink-400" },
    { label: "总评论量", value: report.weeklyComments, icon: MessageCircle, color: "text-yellow-400" },
    { label: "互动率", value: (report.weeklyEngagementRate * 100).toFixed(2) + "%", icon: Activity, color: "text-indigo-400" },
  ] : [];

  const suggestions = report ? parseSuggestions(report.suggestions) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-slate-100">周报分析</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <span className="text-slate-400">至</span>
            <input
              type="date"
              value={weekEnd}
              onChange={(e) => setWeekEnd(e.target.value)}
              className="bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            生成周报
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="metric-card">
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className={cn("h-5 w-5", metric.color)} />
                </div>
                <div className="text-2xl font-bold text-slate-100 mb-1">
                  {typeof metric.value === "number" ? formatNumber(metric.value) : metric.value}
                </div>
                <div className="text-sm text-slate-400">{metric.label}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">平台对比</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#334155]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">平台</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">总粉丝</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">净增粉丝</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">播放量</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">点赞量</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">评论量</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">粉丝增长</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">播放增长</th>
                  </tr>
                </thead>
                <tbody>
                  {report.platformMetrics.map((platform: PlatformWeeklyMetrics) => {
                    const fansGrowth = formatGrowthRate(platform.fansGrowthRate);
                    const viewsGrowth = formatGrowthRate(platform.viewsGrowthRate);
                    return (
                      <tr key={platform.platformId} className="border-b border-[#334155]/50 hover:bg-[#334155]/20">
                        <td className="py-3 px-4">
                          <span className={getPlatformBadgeClass(platform.platformCode)}>
                            {platform.platformName}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-slate-200">{formatNumber(platform.totalFans)}</td>
                        <td className="text-right py-3 px-4 text-sm text-slate-200">{formatNumber(platform.weeklyNetFans)}</td>
                        <td className="text-right py-3 px-4 text-sm text-slate-200">{formatNumber(platform.weeklyViews)}</td>
                        <td className="text-right py-3 px-4 text-sm text-slate-200">{formatNumber(platform.weeklyLikes)}</td>
                        <td className="text-right py-3 px-4 text-sm text-slate-200">{formatNumber(platform.weeklyComments)}</td>
                        <td className="text-right py-3 px-4">
                          <span className={cn("text-sm font-medium", fansGrowth.className)}>
                            {fansGrowth.text}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className={cn("text-sm font-medium", viewsGrowth.className)}>
                            {viewsGrowth.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">7日趋势</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={report.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#E2E8F0",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="newFans"
                    name="新增粉丝"
                    stroke="#60A5FA"
                    strokeWidth={2}
                    dot={{ fill: "#60A5FA", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    name="播放量"
                    stroke="#A78BFA"
                    strokeWidth={2}
                    dot={{ fill: "#A78BFA", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="interactions"
                    name="互动量"
                    stroke="#34D399"
                    strokeWidth={2}
                    dot={{ fill: "#34D399", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">热门内容 Top 5</h3>
              <div className="space-y-3">
                {report.topContents.slice(0, 5).map((content: ContentRank) => (
                  <div
                    key={content.contentId}
                    className="flex items-center gap-4 p-3 rounded-lg bg-[#0F172A] hover:bg-[#334155]/20 transition-colors"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#1E293B] flex items-center justify-center">
                      <span className="text-lg font-bold text-indigo-400">{content.rank}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={getPlatformBadgeClass(content.platformCode)}>
                          {content.platformName}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-slate-200 truncate">
                        {content.contentTitle}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {formatNumber(content.totalViews)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {formatNumber(content.totalLikes)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {(content.engagementRate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-slate-100">优化建议</h3>
              </div>
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <span className="text-xs font-medium text-indigo-400">{index + 1}</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card flex flex-col items-center justify-center py-20">
          <FileText className="h-16 w-16 text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">暂无周报数据</h3>
          <p className="text-sm text-slate-500 mb-4">选择日期范围并点击"生成周报"按钮</p>
          <button onClick={handleGenerateReport} className="btn-primary flex items-center gap-2">
            <FileText className="h-4 w-4" />
            生成周报
          </button>
        </div>
      )}
    </div>
  );
}
