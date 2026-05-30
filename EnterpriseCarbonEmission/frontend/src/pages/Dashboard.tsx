import { useState, useEffect } from 'react';
import { TrendingUp, Factory, Zap, Truck, Leaf, Users, Shield } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getCalculationResults } from '@/api/emissionCalculation';
import { getTargetsByOrg } from '@/api/reductionTarget';
import type { EmissionCalculation, ReductionTarget } from '@/types';

const trendData = [
  { month: '1月', scope1: 120, scope2: 85, scope3: 60 },
  { month: '2月', scope1: 110, scope2: 80, scope3: 55 },
  { month: '3月', scope1: 130, scope2: 90, scope3: 65 },
  { month: '4月', scope1: 115, scope2: 75, scope3: 58 },
  { month: '5月', scope1: 105, scope2: 70, scope3: 52 },
  { month: '6月', scope1: 100, scope2: 68, scope3: 50 },
  { month: '7月', scope1: 95, scope2: 65, scope3: 48 },
  { month: '8月', scope1: 108, scope2: 72, scope3: 55 },
  { month: '9月', scope1: 98, scope2: 66, scope3: 51 },
  { month: '10月', scope1: 92, scope2: 60, scope3: 45 },
  { month: '11月', scope1: 88, scope2: 58, scope3: 42 },
  { month: '12月', scope1: 85, scope2: 55, scope3: 40 },
];

function CircularProgress({ value, color }: { value: number; color: string }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width="80" height="80" className="-rotate-90">
      <circle cx="40" cy="40" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="6" />
      <circle cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-700" />
    </svg>
  );
}

function StatCard({ icon: Icon, label, value, unit, gradient }: {
  icon: React.ElementType; label: string; value: number; unit: string; gradient: string;
}) {
  return (
    <div className={`rounded-xl p-5 text-white shadow-md ${gradient}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{label}</p>
          <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
          <p className="text-xs opacity-70 mt-1">{unit}</p>
        </div>
        <Icon size={36} className="opacity-30" />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return <div className="rounded-xl p-5 bg-white shadow-sm animate-pulse"><div className="h-20 bg-slate-200 rounded" /></div>;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [calcs, setCalcs] = useState<EmissionCalculation[]>([]);
  const [targets, setTargets] = useState<ReductionTarget[]>([]);

  useEffect(() => {
    Promise.all([
      getCalculationResults(1, 3, '2026').catch(() => []),
      getTargetsByOrg(1).catch(() => []),
    ]).then(([calcData, targetData]) => {
      setCalcs(calcData);
      setTargets(targetData);
      setLoading(false);
    });
  }, []);

  const totalEmission = calcs.reduce((s, c) => s + c.emissionTotal, 0);
  const scope1 = calcs.filter(c => c.emissionScope === 1).reduce((s, c) => s + c.emissionTotal, 0);
  const scope2 = calcs.filter(c => c.emissionScope === 2).reduce((s, c) => s + c.emissionTotal, 0);
  const scope3 = calcs.filter(c => c.emissionScope === 3).reduce((s, c) => s + c.emissionTotal, 0);

  const topTargets = targets.slice(0, 3);
  const targetColors = ['#0D9488', '#F59E0B', '#6366F1'];

  const esgCards = [
    { label: '环境(E)', score: 78, color: 'bg-emerald-500', icon: Leaf },
    { label: '社会(S)', score: 72, color: 'bg-blue-500', icon: Users },
    { label: '治理(G)', score: 85, color: 'bg-violet-500', icon: Shield },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-5">
        <StatCard icon={TrendingUp} label="总排放量" value={totalEmission} unit="tCO₂e" gradient="bg-gradient-to-br from-teal-600 to-teal-700" />
        <StatCard icon={Factory} label="范围一" value={scope1} unit="tCO₂e · 直接排放" gradient="bg-gradient-to-br from-teal-500 to-teal-600" />
        <StatCard icon={Zap} label="范围二" value={scope2} unit="tCO₂e · 间接排放" gradient="bg-gradient-to-br from-amber-500 to-amber-600" />
        <StatCard icon={Truck} label="范围三" value={scope3} unit="tCO₂e · 价值链" gradient="bg-gradient-to-br from-violet-500 to-violet-600" />
      </div>

      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-3 bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">排放趋势</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
              <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="scope1" stackId="1" stroke="#0D9488" fill="#0D9488" fillOpacity={0.3} name="范围一" />
              <Area type="monotone" dataKey="scope2" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} name="范围二" />
              <Area type="monotone" dataKey="scope3" stackId="1" stroke="#6366F1" fill="#6366F1" fillOpacity={0.3} name="范围三" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-slate-700">减排目标进度</h3>
          {topTargets.length > 0 ? topTargets.map((t, i) => (
            <div key={t.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
              <CircularProgress value={t.achievementRate ?? 0} color={targetColors[i]} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{t.targetName}</p>
                <p className="text-xs text-slate-400 mt-1">目标减排 {t.targetReductionRate}% · 实际 {t.actualReductionRate}%</p>
                <p className="text-lg font-bold mt-1" style={{ color: targetColors[i] }}>{t.achievementRate ?? 0}%</p>
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center text-sm text-slate-400">暂无减排目标数据</div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-4">ESG 评分</h3>
        <div className="grid grid-cols-3 gap-5">
          {esgCards.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{item.score}</p>
                </div>
                <div className="ml-auto flex flex-col items-end">
                  <span className="text-xs text-slate-400">满分 100</span>
                  <div className="w-24 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
