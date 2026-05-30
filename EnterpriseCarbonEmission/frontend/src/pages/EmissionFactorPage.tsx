import { useState, useEffect, useCallback } from 'react'
import { Plus, Layers, Pencil, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCurrentVersionFactors, getFactorsByType, saveEmissionFactor, addNewVersion, deleteEmissionFactor } from '@/api/emissionFactor'
import type { EmissionFactor } from '@/types'

const FACTOR_TYPES = [
  { value: 0, label: '全部' },
  { value: 1, label: '能源' },
  { value: 2, label: '交通' },
  { value: 3, label: '物料' },
  { value: 4, label: '其他' },
] as const

const TYPE_BADGE: Record<number, { label: string; cls: string }> = {
  1: { label: '能源', cls: 'bg-teal-100 text-teal-700' },
  2: { label: '交通', cls: 'bg-blue-100 text-blue-700' },
  3: { label: '物料', cls: 'bg-amber-100 text-amber-700' },
  4: { label: '其他', cls: 'bg-gray-100 text-gray-600' },
}

const VERSION_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-orange-100 text-orange-700',
]

function getVersionBadge(version: string) {
  let hash = 0
  for (let i = 0; i < version.length; i++) hash = version.charCodeAt(i) + ((hash << 5) - hash)
  return VERSION_COLORS[Math.abs(hash) % VERSION_COLORS.length]
}

function formatFactor(v: number) {
  return v.toFixed(6)
}

const emptyFactor: Partial<EmissionFactor> = {
  factorCode: '', factorName: '', factorType: 1, category: '',
  subCategory: '', unit: '', co2Factor: 0, ch4Factor: 0,
  n2oFactor: 0, totalFactor: 0, version: '', standardSource: '', calculationFormula: '',
}

export default function EmissionFactorPage() {
  const [factors, setFactors] = useState<EmissionFactor[]>([])
  const [activeType, setActiveType] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [isNewVersion, setIsNewVersion] = useState(false)
  const [form, setForm] = useState<Partial<EmissionFactor>>({ ...emptyFactor })

  const loadFactors = useCallback(async () => {
    try {
      const data = activeType === 0
        ? await getCurrentVersionFactors()
        : await getFactorsByType(activeType)
      setFactors(data)
    } catch {
      setFactors([])
    }
  }, [activeType])

  useEffect(() => { loadFactors() }, [loadFactors])

  const openAddModal = () => {
    setIsNewVersion(false)
    setForm({ ...emptyFactor })
    setShowModal(true)
  }

  const openVersionModal = () => {
    setIsNewVersion(true)
    setForm({ ...emptyFactor })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    try {
      if (isNewVersion) {
        await addNewVersion(form as EmissionFactor)
      } else {
        await saveEmissionFactor(form as EmissionFactor)
      }
      setShowModal(false)
      loadFactors()
    } catch { /* handled by interceptor */ }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteEmissionFactor(id)
      loadFactors()
    } catch { /* handled by interceptor */ }
  }

  const setField = <K extends keyof EmissionFactor>(key: K, val: EmissionFactor[K]) => {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {FACTOR_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setActiveType(t.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeType === t.value
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={openAddModal} className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
            <Plus size={16} /> 新增因子
          </button>
          <button onClick={openVersionModal} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Layers size={16} /> 新增版本
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-600">因子编码</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">因子名称</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">类型</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">单位</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">综合因子</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">版本</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">标准来源</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">状态</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {factors.map((f, idx) => {
              const badge = TYPE_BADGE[f.factorType] ?? TYPE_BADGE[4]
              return (
                <tr key={f.id} className={cn('border-b border-slate-100', idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                  <td className="px-4 py-3 font-mono text-slate-700">{f.factorCode}</td>
                  <td className="px-4 py-3 text-slate-800">{f.factorName}</td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium', badge.cls)}>{badge.label}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{f.unit}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{formatFactor(f.totalFactor)}</td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium', getVersionBadge(f.version))}>{f.version}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate">{f.standardSource}</td>
                  <td className="px-4 py-3">
                    {f.isCurrent === 1
                      ? <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">当前版本</span>
                      : <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">历史</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(f.id)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {factors.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-400">暂无数据</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">{isNewVersion ? '新增版本' : '新增因子'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-slate-100 text-slate-400"><X size={18} /></button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="因子编码" value={form.factorCode ?? ''} onChange={v => setField('factorCode', v)} />
                <Field label="因子名称" value={form.factorName ?? ''} onChange={v => setField('factorName', v)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="text-slate-600 mb-1 block">因子类型</span>
                  <select value={form.factorType ?? 1} onChange={e => setField('factorType', Number(e.target.value))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value={1}>能源</option><option value={2}>交通</option><option value={3}>物料</option><option value={4}>其他</option>
                  </select>
                </label>
                <Field label="单位" value={form.unit ?? ''} onChange={v => setField('unit', v)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="分类" value={form.category ?? ''} onChange={v => setField('category', v)} />
                <Field label="子分类" value={form.subCategory ?? ''} onChange={v => setField('subCategory', v)} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="CO₂因子" type="number" value={form.co2Factor ?? 0} onChange={v => setField('co2Factor', Number(v))} />
                <Field label="CH₄因子" type="number" value={form.ch4Factor ?? 0} onChange={v => setField('ch4Factor', Number(v))} />
                <Field label="N₂O因子" type="number" value={form.n2oFactor ?? 0} onChange={v => setField('n2oFactor', Number(v))} />
              </div>
              <Field label="综合因子" type="number" value={form.totalFactor ?? 0} onChange={v => setField('totalFactor', Number(v))} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="版本" value={form.version ?? ''} onChange={v => setField('version', v)} />
                <Field label="标准来源" value={form.standardSource ?? ''} onChange={v => setField('standardSource', v)} />
              </div>
              <label className="block text-sm">
                <span className="text-slate-600 mb-1 block">计算公式</span>
                <textarea value={form.calculationFormula ?? ''} onChange={e => setField('calculationFormula', e.target.value)} rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              </label>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-200">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">取消</button>
              <button onClick={handleSubmit} className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors">确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string | number; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block text-sm">
      <span className="text-slate-600 mb-1 block">{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
    </label>
  )
}
