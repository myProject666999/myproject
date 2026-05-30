import { useEffect, useState } from "react";
import {
  Users,
  Play,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getDashboardOverview } from "@/utils/api";
import type { DashboardOverview, PlatformMetrics } from "@/types";

const platformBadgeClass: Record<string, string> = {
  DOUYIN: "badge-douyin",
  BILIBILI: "badge-bilibili",
  XIAOHONGSHU: "badge-xiaohongshu",
};

const platformGradient: Record<string, string> = {
  DOUYIN: "from-pink-500 to-rose-500",
  BILIBILI: "from-cyan-500 to-blue-500",
  XIAOHONGSHU: "from-red-500 to-orange-500",
};

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  gradient: string;
}

function MetricCard({ title, value, change, icon, gradient }: MetricCardProps) {
  const isPositive = change >= 0;
  return (
    <div className="metric-card card-hover">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} bg-opacity-10`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1">
        {isPositive ? (
          <TrendingUp className="w-4 h-4 trend-up" />
        ) : (
          <TrendingDown className="w-4 h-4 trend-down" />
        )}
        <span className={isPositive ? "trend-up" : "trend-down"}>
          {isPositive ? "+" : ""}
          {change.toLocaleString()}
        </span>
        <span className="text-slate-500 text-sm">较昨日</span>
      </div>
    </div>
  );
}

function PlatformCard({ platform }: { platform: PlatformMetrics }) {
  const badgeClass = platformBadgeClass[platform.platformCode] || "badge";
  const gradient = platformGradient[platform.platformCode] || "from-slate-500 to-slate-600";

  return (
    <div className="card card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white">{platform.platformAccountName}</p>
            <span className={badgeClass}>{platform.platformName}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-slate-400">粉丝</p>
          <p className="text-lg font-semibold text-white">{platform.totalFans.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">播放</p>
          <p className="text-lg font-semibold text-white">{platform.totalViews.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">点赞</p>
          <p className="text-lg font-semibold text-white">{platform.totalLikes.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">互动率</p>
          <p className="text-lg font-semibold text-white">{(platform.engagementRate * 100).toFixed(2)}%</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboardOverview(1);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400">暂无数据</p>
      </div>
    );
  }

  const metrics: MetricCardProps[] = [
    {
      title: "总粉丝",
      value: data.totalFans,
      change: data.totalFansChange,
      icon: <Users className="w-5 h-5 text-white" />,
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      title: "总播放",
      value: data.totalViews,
      change: data.totalViewsChange,
      icon: <Play className="w-5 h-5 text-white" />,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "总点赞",
      value: data.totalLikes,
      change: data.totalLikesChange,
      icon: <ThumbsUp className="w-5 h-5 text-white" />,
      gradient: "from-pink-500 to-rose-500",
    },
    {
      title: "总评论",
      value: data.totalComments,
      change: data.totalCommentsChange,
      icon: <MessageCircle className="w-5 h-5 text-white" />,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      title: "总分享",
      value: data.totalShares,
      change: data.totalSharesChange,
      icon: <Share2 className="w-5 h-5 text-white" />,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      title: "总收藏",
      value: data.totalCollects,
      change: data.totalCollectsChange,
      icon: <Bookmark className="w-5 h-5 text-white" />,
      gradient: "from-violet-500 to-fuchsia-500",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">数据概览</h1>
          <p className="text-slate-400 text-sm mt-1">统计日期: {data.statDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">平台数据对比</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.platformMetrics.map((platform) => (
            <PlatformCard key={platform.platformId} platform={platform} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">7天粉丝趋势</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.fansTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94A3B8" tick={{ fill: "#94A3B8" }} />
              <YAxis stroke="#94A3B8" tick={{ fill: "#94A3B8" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1E293B",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#E2E8F0" }}
                itemStyle={{ color: "#818CF8" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#818CF8"
                strokeWidth={2}
                dot={{ fill: "#818CF8", strokeWidth: 2 }}
                name="粉丝数"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">7天播放趋势</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.viewsTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94A3B8" tick={{ fill: "#94A3B8" }} />
              <YAxis stroke="#94A3B8" tick={{ fill: "#94A3B8" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1E293B",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#E2E8F0" }}
                itemStyle={{ color: "#22D3EE" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#22D3EE"
                strokeWidth={2}
                dot={{ fill: "#22D3EE", strokeWidth: 2 }}
                name="播放量"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
