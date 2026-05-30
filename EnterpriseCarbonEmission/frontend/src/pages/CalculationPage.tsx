import { useState, useEffect, useCallback } from 'react'
import { Factory, Zap, Truck, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { calculateEmission, getCalculationResults } from '@/api/emissionCalculation'
import { getOrganizationTree } from '@/api/organization'
import type { EmissionCalculation, Organization } from '@/types'

const PERIOD_OPTIONS = [
  { value: 1, label: '月度' },
  { value: 2, label: '季度' },
  { value: 3, label: '年度' },
]

const SCOPE_META: Record<number, { label: string; icon: typeof Factory; bg: string; border: string; iconColor: string; valueColor: string }> = {
  1: { label: '范围一', icon: Factory, bg: 'bg-blue-50', border: 'border-blue-200', iconColor: 'text-blue-500', valueColor: 'text-blue-700' },
  2: { label: '范围二', icon: Zap, bg: 'bg-amber-50', border: 'border-amber-200', iconColor: 'text-amber-500', valueColor: 'text-amber-700' },
  3: { label: '范围三', icon: Truck, bg: 'bg-purple-50', border: 'border-purple-200', iconColor: 'text-purple-500', valueColor: 'text-purple-700' },
}

function formatEmission(v: number) {
  return v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function flattenOrgs(orgs: Organization[]): Organization[] {
  return orgs.flatMap(o => [o, ...(o.children ? flattenOrgs(o.children) : [])])
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
      <div className="h-5 w-24 bg-slate-200 rounded" />
      <div className="h-10 w-40 bg-slate-200 rounded" />
      <div className="h-4 w-16 bg-slate-100 rounded" />
    </div>
  )
}

export default function CalculationPage() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [orgId, setOrgId] = useState<number>(0)
  const [periodType, setPeriodType] = useState(1)
  const [periodValue, setPeriodValue] = useState('')
  const [calculating, setCalculating] = useState(false)
  const [results, setResults] = useState<EmissionCalculation[]>([])
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [hasCalculated, setHasCalculated] = useState(false)

  useEffect(() => {
    getOrganizationTree().then(data => {
      setOrgs(flattenOrgs(data))
    }).catch(() => setOrgs([]))
  }, [])

  const scopeSummary = useCallback(() => {
    const summary: Record<number, number> = { 1: 0, 2: 0, 3: 0 }
    results.forEach(r => {
      if (r.emissionScope >= 1 && r.emissionScope <= 3) {
        summary[r.emissionScope] += r.emissionTotal
      }
    })
    return summary
  }, [results])

  const handleCalculate = async () => {
    if (!orgId || !periodValue) return
    setCalculating(true)
    setHasCalculated(true)
    try {
      await calculateEmission(orgId, periodType, periodValue)
      const data = await getCalculationResults(orgId, periodType, periodValue)
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setCalculating(false)
    }
  }

  const toggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  const summary = scopeSummary()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-end gap-4">
          <label className="block text-sm flex-1 min-w-0">
            <span className="text-slate-600 mb-1 block">组织</span>
            <select value={orgId} onChange={e => setOrgId(Number(e.target.value))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value={0}>请选择组织</option>
              {orgs.map(o => <option key={o.id} value={o.id}>{o.orgName}</option>)}
            </select>
          </label>
          <label className="block text-sm w-32">
            <span className="text-slate-600 mb-1 block">核算周期</span>
            <select value={periodType} onChange={e => setPeriodType(Number(e.target.value))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              {PERIOD_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </label>
          <label className="block text-sm w-40">
            <span className="text-slate-600 mb-1 block">周期值</span>
            <input type="text" value={periodValue} onChange={e => setPeriodValue(e.target.value)} placeholder="如 2024-01" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </label>
          <button onClick={handleCalculate} disabled={calculating || !orgId || !periodValue} className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
            {calculating ? <><Loader2 size={16} className="animate-spin" /> 核算中...</> : '执行核算'}
          </button>
        </div>
      </div>

      {calculating && (
        <div className="grid grid-cols-3 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      )}

      {hasCalculated && !calculating && (
        <div className="grid grid-cols-3 gap-4">
          {([1, 2, 3] as const).map(scope => {
            const meta = SCOPE_META[scope]
            const Icon = meta.icon
            return (
              <div key={scope} className={cn('rounded-2xl border p-6', meta.bg, meta.border)}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={20} className={meta.iconColor} />
                  <span className="text-sm font-medium text-slate-600">{meta.label}</span>
                </div>
                <div className={cn('text-3xl font-bold', meta.valueColor)}>{formatEmission(summary[scope])}</div>
                <div className="text-xs text-slate-400 mt-1">tCO2e</div>
              </div>
            )
          })}
        </div>
      )}

      {hasCalculated && !calculating && results.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">排放范围</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">源类型</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">活动量合计</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">排放量合计</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">因子版本</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">计算公式</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => {
                const scopeMeta = SCOPE_META[r.emissionScope]
                const isExpanded = expandedId === r.id
                return (
                  <tr key={r.id} className={cn('border-b border-slate-100', idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                    <td className="px-4 py-3">
                      {scopeMeta ? <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', scopeMeta.bg, scopeMeta.iconColor)}>{scopeMeta.label}</span> : r.emissionScope}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{r.sourceType}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{r.activityTotal}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatEmission(r.emissionTotal)}</td>
                    <td className="px-4 py-3"><span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">{r.factorVersion}</span></td>
                    <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">{r.calculationFormula}</td>
                    <td className="px-4 py-1">
                      <button onClick={() => toggleExpand(r.id)} className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {expandedId !== null && (() => {
            const row = results.find(r => r.id === expandedId)
            if (!row) return null
            return (
              <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                <div className="text-xs text-slate-500 mb-2 font-medium">计算公式详情</div>
                <pre className="font-mono text-sm text-slate-800 whitespace-pre-wrap bg-white rounded-lg border border-slate-200 p-4">{row.calculationFormula}</pre>
              </div>
            )
          })()}
        </div>
      )}

      {hasCalculated && !calculating && results.length === 0 && (
        <div className="text-center py-12 text-slate-400">暂无核算结果</div>
      )}
    </div>
  )
}
