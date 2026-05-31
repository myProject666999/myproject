import { useState, useEffect, useCallback } from 'react';
import { Plus, Target, X } from 'lucide-react';
import { getReductionTargetPage, saveReductionTarget, updateTargetProgress, deleteReductionTarget } from '@/api/reductionTarget';
import { getOrganizationList } from '@/api/organization';
import type { ReductionTarget, Organization } from '@/types';

const STATUS_MAP: Record<number, { label: string; cls: string }> = {
  0: { label: '未开始', cls: 'bg-gray-100 text-gray-600' },
  1: { label: '进行中', cls: 'bg-blue-100 text-blue-700' },
  2: { label: '已完成', cls: 'bg-green-100 text-green-700' },
  3: { label: '已逾期', cls: 'bg-red-100 text-red-700' },
};

const TYPE_MAP: Record<number, { label: string; cls: string }> = {
  1: { label: '绝对减排', cls: 'bg-teal-100 text-teal-700' },
  2: { label: '强度减排', cls: 'bg-amber-100 text-amber-700' },
};

function progressColor(rate: number) {
  if (rate < 30) return 'bg-red-500';
  if (rate <= 70) return 'bg-amber-500';
  return 'bg-green-500';
}

const EMPTY_TARGET: Partial<ReductionTarget> = {
  orgId: 1, targetName: '', targetType: 1, emissionScope: 4,
  baseYear: '', baseEmission: 0, targetYear: '', targetReductionRate: 0,
  targetEmission: 0, description: '', measures: '', status: 1,
};

export default function ReductionTargetPage() {
  const [targets, setTargets] = useState<ReductionTarget[]>([]);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<ReductionTarget | null>(null);
  const [actualEmission, setActualEmission] = useState('');
  const [form, setForm] = useState<Partial<ReductionTarget>>({ ...EMPTY_TARGET });
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    getOrganizationList().then(res => setOrganizations(res)).catch(() => setOrganizations([]));
  }, []);

  const fetchTargets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReductionTargetPage({ status: statusFilter, pageNum: 1, pageSize: 100 });
      setTargets(res.records);
    } catch { setTargets([]); }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchTargets(); }, [fetchTargets]);

  const handleAdd = async () => {
    await saveReductionTarget(form as ReductionTarget);
    setShowAddModal(false);
    setForm({ ...EMPTY_TARGET });
    fetchTargets();
  };

  const handleUpdateProgress = async () => {
    if (!selectedTarget) return;
    await updateTargetProgress(selectedTarget.id, Number(actualEmission));
    setShowProgressModal(false);
    setSelectedTarget(null);
    setActualEmission('');
    fetchTargets();
  };

  const handleDelete = async (id: number) => {
    await deleteReductionTarget(id);
    fetchTargets();
  };

  const openProgressModal = (t: ReductionTarget) => {
    setSelectedTarget(t);
    setActualEmission(String(t.actualEmission ?? ''));
    setShowProgressModal(true);
  };

  const updateForm = (key: keyof ReductionTarget, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">减排目标</h1>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
          <Plus size={18} />新增目标
        </button>
      </div>

      <div className="flex gap-2">
        {[undefined, 0, 1, 2, 3].map(s => (
          <button key={s ?? 'all'} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${statusFilter === s ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {s === undefined ? '全部' : STATUS_MAP[s].label}
          </button>
        ))}
      </div>

      {loading ? <p className="text-slate-400">加载中...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {targets.map(t => (
            <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Target size={18} className="text-teal-600" />
                  <h3 className="font-semibold text-slate-800">{t.targetName}</h3>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_MAP[t.targetType as keyof typeof TYPE_MAP]?.cls ?? ''}`}>
                  {TYPE_MAP[t.targetType as keyof typeof TYPE_MAP]?.label}
                </span>
              </div>
              <div className="text-sm text-slate-500">{t.baseYear} → {t.targetYear}</div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">基准排放</span>
                <span className="font-medium text-slate-700">{t.baseEmission} tCO₂</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">目标排放</span>
                <span className="font-medium text-slate-700">{t.targetEmission} tCO₂</span>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">完成进度</span>
                  <span className="font-medium">{t.achievementRate}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${progressColor(t.achievementRate)}`} style={{ width: `${Math.min(t.achievementRate, 100)}%` }} />
                </div>
              </div>
              <div className="text-xs text-slate-400">目标减排率: {t.targetReductionRate}%</div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_MAP[t.status as keyof typeof STATUS_MAP]?.cls ?? ''}`}>
                  {STATUS_MAP[t.status as keyof typeof STATUS_MAP]?.label}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => openProgressModal(t)} className="text-xs px-3 py-1 bg-teal-50 text-teal-700 rounded-md hover:bg-teal-100">更新进度</button>
                  <button onClick={() => handleDelete(t.id)} className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100">删除</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">新增减排目标</h2>
              <button onClick={() => setShowAddModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <select className="input-field" value={form.orgId ?? 1} onChange={e => updateForm('orgId', Number(e.target.value))}>
                {organizations.map(org => <option key={org.id} value={org.id}>{org.orgName}</option>)}
              </select>
              <input placeholder="目标名称" className="input-field col-span-2" value={form.targetName} onChange={e => updateForm('targetName', e.target.value)} />
              <select className="input-field" value={form.targetType} onChange={e => updateForm('targetType', Number(e.target.value))}>
                <option value={1}>绝对减排</option><option value={2}>强度减排</option>
              </select>
              <select className="input-field" value={form.emissionScope} onChange={e => updateForm('emissionScope', Number(e.target.value))}>
                <option value={1}>范围一</option><option value={2}>范围二</option><option value={3}>范围三</option><option value={4}>全范围</option>
              </select>
              <input placeholder="基准年份" className="input-field" value={form.baseYear} onChange={e => updateForm('baseYear', e.target.value)} />
              <input placeholder="基准排放量" type="number" className="input-field" value={form.baseEmission || ''} onChange={e => updateForm('baseEmission', Number(e.target.value))} />
              <input placeholder="目标年份" className="input-field" value={form.targetYear} onChange={e => updateForm('targetYear', e.target.value)} />
              <input placeholder="目标减排率(%)" type="number" className="input-field" value={form.targetReductionRate || ''} onChange={e => updateForm('targetReductionRate', Number(e.target.value))} />
              <input placeholder="目标排放量" type="number" className="input-field col-span-2" value={form.targetEmission || ''} onChange={e => updateForm('targetEmission', Number(e.target.value))} />
              <input placeholder="描述" className="input-field col-span-2" value={form.description} onChange={e => updateForm('description', e.target.value)} />
              <textarea placeholder="措施" className="input-field col-span-2" rows={3} value={form.measures} onChange={e => updateForm('measures', e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">取消</button>
              <button onClick={handleAdd} className="px-4 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700">确认</button>
            </div>
          </div>
        </div>
      )}

      {showProgressModal && selectedTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">更新进度 - {selectedTarget.targetName}</h2>
              <button onClick={() => setShowProgressModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div>
              <label className="text-sm text-slate-600 mb-1 block">实际排放量 (tCO₂)</label>
              <input type="number" className="input-field" value={actualEmission} onChange={e => setActualEmission(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowProgressModal(false)} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">取消</button>
              <button onClick={handleUpdateProgress} className="px-4 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700">确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
