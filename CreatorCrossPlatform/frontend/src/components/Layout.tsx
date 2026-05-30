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

  const handleExport = () => {
    const pageTitle = navItems.find((item) => item.path === location.pathname)?.label ?? "数据总览";
    const exportData = {
      page: pageTitle,
      exportTime: new Date().toLocaleString("zh-CN"),
      version: "1.0",
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CreatorHub_${pageTitle}_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("报告导出成功！");
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
