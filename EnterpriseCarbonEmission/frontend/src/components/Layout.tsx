import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Leaf,
  Database,
  Calculator,
  Target,
  BarChart3,
  FileText,
  Building2,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react'

const navItems = [
  { path: '/', label: '总览仪表盘', icon: LayoutDashboard },
  { path: '/emission-data', label: '排放数据', icon: Leaf },
  { path: '/emission-factor', label: '排放因子', icon: Database },
  { path: '/calculation', label: '核算结果', icon: Calculator },
  { path: '/reduction-target', label: '减排目标', icon: Target },
  { path: '/esg-indicator', label: 'ESG指标', icon: BarChart3 },
  { path: '/report', label: '报告生成', icon: FileText },
  { path: '/organization', label: '组织管理', icon: Building2 },
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const activeItem = navItems.find(
    (item) => item.path === location.pathname
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside
        className="flex flex-col shrink-0 transition-all duration-300"
        style={{
          width: collapsed ? 64 : 240,
          backgroundColor: '#1E293B',
        }}
      >
        <div className="flex items-center h-16 px-4 border-b border-slate-700">
          {!collapsed && (
            <span className="text-lg font-bold text-white tracking-wide">
              碳排放管理
            </span>
          )}
          {collapsed && (
            <span className="text-lg font-bold text-white mx-auto">碳</span>
          )}
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 mx-2 my-0.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                style={
                  isActive
                    ? { backgroundColor: '#0D9488' }
                    : undefined
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="shrink-0" size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-10 border-t border-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 shrink-0">
          <h1 className="text-lg font-semibold text-slate-800">
            {activeItem?.label ?? '碳排放管理平台'}
          </h1>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <User size={18} />
            <span>管理员</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
