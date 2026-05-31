import { useLocation, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Trophy,
  TrendingUp,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "数据总览" },
  { path: "/content-rank", icon: Trophy, label: "内容排行" },
  { path: "/trend-analysis", icon: TrendingUp, label: "趋势分析" },
  { path: "/publish-time", icon: Clock, label: "发布时段" },
  { path: "/weekly-report", icon: FileText, label: "周报" },
];

export default function Layout() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  const handleExport = async () => {
    const pageTitle = navItems.find((item) => item.path === location.pathname)?.label ?? "数据总览";
    const creatorId = 1;

    try {
      let csvContent = "\uFEFF";
      csvContent += `创作者跨平台数据聚合分析台 - ${pageTitle}报告\n`;
      csvContent += `导出时间: ${new Date().toLocaleString("zh-CN")}\n\n`;

      if (location.pathname === "/" || location.pathname === "/dashboard") {
        const { getDashboardOverview } = await import("@/utils/api");
        const data = await getDashboardOverview(creatorId);
        csvContent += "=== 核心指标汇总 ===\n";
        csvContent += "指标名称,当前值,变化值,增长率\n";
        csvContent += `总粉丝数,${data.totalFans?.toLocaleString()},${data.totalFansChange ?? 0},${data.totalFansGrowthRate ?? 0}%\n`;
        csvContent += `总播放量,${data.totalViews?.toLocaleString()},${data.totalViewsChange ?? 0},${data.totalViewsGrowthRate ?? 0}%\n`;
        csvContent += `总点赞数,${data.totalLikes?.toLocaleString()},${data.totalLikesChange ?? 0},\n`;
        csvContent += `总评论数,${data.totalComments?.toLocaleString()},${data.totalCommentsChange ?? 0},\n`;
        csvContent += `总分享数,${data.totalShares?.toLocaleString()},${data.totalSharesChange ?? 0},\n`;
        csvContent += `总收藏数,${data.totalCollects?.toLocaleString()},${data.totalCollectsChange ?? 0},\n`;
        csvContent += `平均互动率,${data.avgEngagementRate ?? 0}%,${data.avgEngagementRateChange ?? 0},\n\n`;

        csvContent += "=== 各平台数据对比 ===\n";
        csvContent += "平台,账号,总粉丝,新增粉丝,净增粉丝,总播放,日播放,总点赞,总评论,总分享,总收藏,互动率,内容数\n";
        data.platformMetrics?.forEach((p) => {
          csvContent += `${p.platformName},${p.platformAccountName},${p.totalFans?.toLocaleString()},${p.newFans},${p.netFans},${p.totalViews?.toLocaleString()},${p.dailyViews?.toLocaleString()},${p.totalLikes?.toLocaleString()},${p.totalComments?.toLocaleString()},${p.totalShares?.toLocaleString()},${p.totalCollects?.toLocaleString()},${p.engagementRate ?? 0}%,${p.contentCount}\n`;
        });
        csvContent += "\n=== 粉丝趋势数据 ===\n";
        csvContent += "日期,粉丝数\n";
        data.fansTrend?.forEach((t) => {
          csvContent += `${t.date},${t.value?.toLocaleString()}\n`;
        });
      } else if (location.pathname === "/content-rank") {
        const { getContentRank } = await import("@/utils/api");
        const data = await getContentRank({ creatorId, pageSize: 100 });
        csvContent += "=== 内容排行（前100条） ===\n";
        csvContent += "排名,标题,平台,发布时间,播放量,点赞数,评论数,分享数,收藏数,互动率,热度值\n";
        data.records?.forEach((c) => {
          csvContent += `${c.rank},"${c.contentTitle}",${c.platformName},${c.publishTime},${c.totalViews?.toLocaleString()},${c.totalLikes?.toLocaleString()},${c.totalComments?.toLocaleString()},${c.totalShares?.toLocaleString()},${c.totalCollects?.toLocaleString()},${c.engagementRate ?? 0}%,${c.hotValue?.toLocaleString()}\n`;
        });
      } else if (location.pathname === "/trend-analysis") {
        const { getFansTrend, getViewsTrend, getEngagementTrend } = await import("@/utils/api");
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        const params = {
          creatorId,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        };
        const [fansData, viewsData, engagementData] = await Promise.all([
          getFansTrend(params),
          getViewsTrend(params),
          getEngagementTrend(params),
        ]);
        csvContent += "=== 粉丝趋势（近7天） ===\n";
        Object.entries(fansData).forEach(([platform, trends]) => {
          csvContent += `平台: ${platform}\n`;
          csvContent += "日期,新增粉丝\n";
          trends.forEach((t) => csvContent += `${t.date},${t.value?.toLocaleString()}\n`);
        });
        csvContent += "\n=== 播放量趋势（近7天） ===\n";
        Object.entries(viewsData).forEach(([platform, trends]) => {
          csvContent += `平台: ${platform}\n`;
          csvContent += "日期,播放量\n";
          trends.forEach((t) => csvContent += `${t.date},${t.value?.toLocaleString()}\n`);
        });
      } else if (location.pathname === "/publish-time") {
        const { getPublishTimeAnalysis } = await import("@/utils/api");
        const data = await getPublishTimeAnalysis(creatorId);
        csvContent += "=== 24小时发布效果分析 ===\n";
        csvContent += "时段,作品数,平均播放,平均点赞,互动率,综合评分\n";
        data.hourAnalysis?.forEach((h) => {
          csvContent += `${h.publishHour.toString().padStart(2, "0")}:00,${h.contentCount},${h.avgViews?.toLocaleString()},${h.avgLikes?.toLocaleString()},${h.avgEngagementRate ?? 0}%,${h.score?.toFixed(2)}\n`;
        });
        csvContent += `\n最佳发布时段: ${data.bestPublishHour?.toString().padStart(2, "0")}:00, 评分: ${data.bestHourScore?.toFixed(1)}\n`;
      } else if (location.pathname === "/weekly-report") {
        const { generateWeeklyReport } = await import("@/utils/api");
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        const data = await generateWeeklyReport({
          creatorId,
          weekStart: startDate.toISOString().split("T")[0],
          weekEnd: endDate.toISOString().split("T")[0],
        });
        csvContent += `=== 周报 (${data.weekStartDate} ~ ${data.weekEndDate}) ===\n\n`;
        csvContent += "本周核心指标:\n";
        csvContent += `总粉丝数,${data.totalFans?.toLocaleString()}\n`;
        csvContent += `本周净增粉丝,${data.weeklyNetFans?.toLocaleString()}\n`;
        csvContent += `本周播放量,${data.weeklyViews?.toLocaleString()}\n`;
        csvContent += `本周点赞数,${data.weeklyLikes?.toLocaleString()}\n`;
        csvContent += `本周评论数,${data.weeklyComments?.toLocaleString()}\n`;
        csvContent += `粉丝增长率,${data.fansGrowthRate ?? 0}%\n`;
        csvContent += `播放量增长率,${data.viewsGrowthRate ?? 0}%\n\n`;
        csvContent += `最佳内容: ${data.topContentTitle}, 播放量: ${data.topContentViews?.toLocaleString()}\n\n`;
        csvContent += `总结: ${data.summary}\n\n`;
        csvContent += `建议: ${data.suggestions}\n`;
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CreatorHub_${pageTitle}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert("报告导出成功！已生成CSV文件，可直接用Excel打开查看。");
    } catch (e) {
      console.error("导出失败:", e);
      alert("导出失败，请稍后重试。");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full flex-col bg-[#0F172A] border-r border-[#1E293B] transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-60"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-[#1E293B]">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-400" />
              <span className="text-lg font-semibold gradient-text">CreatorHub</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-[#1E293B] hover:text-white transition-colors",
              sidebarCollapsed && "mx-auto"
            )}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "text-slate-400 hover:bg-[#1E293B] hover:text-slate-200"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-indigo-400")} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-60"
        )}
      >
        <header className="flex h-16 items-center justify-between border-b border-[#1E293B] bg-[#0F172A] px-6">
          <h1 className="text-lg font-semibold text-slate-200">
            {navItems.find((item) => item.path === location.pathname)?.label ?? "数据总览"}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              导出报告
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
