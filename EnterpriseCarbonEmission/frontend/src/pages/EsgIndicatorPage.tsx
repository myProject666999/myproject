import { useState, useEffect, useCallback } from 'react';
import { Leaf, Users, Shield, ClipboardList, X } from 'lucide-react';
import { getIndicatorsByDimension, getIndicatorDataPage, saveIndicatorData } from '@/api/esgIndicator';
import { getOrganizationList } from '@/api/organization';
import type { EsgIndicator, EsgIndicatorData, Organization } from '@/types';

const DIMENSIONS = [
  { key: 1, label: '环境 (E)', color: 'bg-green-600', activeColor: 'bg-green-600 text-white', icon: Leaf },
  { key: 2, label: '社会 (S)', color: 'bg-blue-600', activeColor: 'bg-blue-600 text-white', icon: Users },
  { key: 3, label: '治理 (G)', color: 'bg-amber-600', activeColor: 'bg-amber-600 text-white', icon: Shield },
];

const DATA_STATUS: Record<number, { label: string; cls: string }> = {
  0: { label: '待审核', cls: 'bg-amber-100 text-amber-700' },
  1: { label: '已通过', cls: 'bg-green-100 text-green-700' },
  2: { label: '已驳回', cls: 'bg-red-100 text-red-700' },
};

const PERIOD_TYPES = [
  { value: 1, label: '年度' },
  { value: 2, label: '季度' },
  { value: 3, label: '月度' },
];

const EMPTY_DATA: Partial<EsgIndicatorData> = {
  indicatorId: 0, orgId: 1, periodType: 1, periodValue: '', indicatorValue: 0, indicatorText: '',
};

export default function EsgIndicatorPage() {
  const [dimension, setDimension] = useState(1);
  const [indicators, setIndicators] = useState<EsgIndicator[]>([]);
  const [selected, setSelected] = useState<EsgIndicator | null>(null);
  const [dataList, setDataList] = useState<EsgIndicatorData[]>([]);
  const [showDataModal, setShowDataModal] = useState(false);
  const [dataForm, setDataForm] = useState<Partial<EsgIndicatorData>>({ ...EMPTY_DATA });
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    getOrganizationList().then(res => setOrganizations(res)).catch(() => setOrganizations([]));
  }, []);

  const fetchIndicators = useCallback(async () => {
    setLoading(true);
    setSelected(null);
    setDataList([]);
    try {
      const res = await getIndicatorsByDimension(dimension);
      setIndicators(res);
    } catch { setIndicators([]); }
    setLoading(false);
  }, [dimension]);

  useEffect(() => { fetchIndicators(); }, [fetchIndicators]);

  const fetchIndicatorData = useCallback(async (indicatorId: number) => {
    try {
      const res = await getIndicatorDataPage({ indicatorId, pageNum: 1, pageSize: 50 });
      setDataList(res.records);
    } catch { setDataList([]); }
  }, []);

  const selectIndicator = (ind: EsgIndicator) => {
    setSelected(ind);
    fetchIndicatorData(ind.id);
  };

  const openDataModal = () => {
    if (!selected) return;
    setDataForm({ ...EMPTY_DATA, indicatorId: selected.id });
    setShowDataModal(true);
  };

  const handleSaveData = async () => {
    await saveIndicatorData(dataForm as EsgIndicatorData);
    setShowDataModal(false);
    if (selected) fetchIndicatorData(selected.id);
  };

  const updateDataForm = (key: keyof EsgIndicatorData, value: unknown) =>
    setDataForm(prev => ({ ...prev, [key]: value }));

  const currentDim = DIMENSIONS.find(d => d.key === dimension)!;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">ESG指标管理</h1>

      <div className="flex gap-2">
        {DIMENSIONS.map(d => {
          const Icon = d.icon;
          return (
            <button key={d.key} onClick={() => setDimension(d.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${dimension === d.key ? d.activeColor : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <Icon size={16} />{d.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-4 min-h-[500px]">
        <div className="w-64 shrink-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className={`px-4 py-3 text-white text-sm font-semibold ${currentDim.color}`}>
            指标列表
          </div>
          <div className="overflow-y-auto max-h-[460px]">
            {loading ? <p className="p-4 text-slate-400 text-sm">加载中...</p> : (
              indicators.map(ind => (
                <button key={ind.id} onClick={() => selectIndicator(ind)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-50 transition ${selected?.id === ind.id ? 'bg-slate-50 border-l-2' : 'hover:bg-slate-25'}`}
                  style={selected?.id === ind.id ? { borderLeftColor: currentDim.color.replace('bg-', '') } : {}}>
                  <div className="font-medium text-sm text-slate-800">{ind.indicatorName}</div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-slate-400">{ind.indicatorCode}</span>
                    {ind.unit && <span className="text-xs text-slate-400">| {ind.unit}</span>}
                  </div>
                  {ind.standard && <div className="text-xs text-slate-400 mt-0.5">{ind.standard}</div>}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden">
          {selected ? (
            <>
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <div>
                  <h2 className="font-semibold text-slate-800">{selected.indicatorName}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{selected.indicatorCode} · {selected.unit || '无量纲'} · {selected.standard}</p>
                </div>
                <button onClick={openDataModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700">
                  <ClipboardList size={15} />录入数据
                </button>
              </div>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500">
                      <th className="text-left px-5 py-2.5 font-medium">周期</th>
                      <th className="text-left px-5 py-2.5 font-medium">指标值</th>
                      <th className="text-left px-5 py-2.5 font-medium">定性描述</th>
                      <th className="text-left px-5 py-2.5 font-medium">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataList.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-8 text-slate-400">暂无数据</td></tr>
                    ) : dataList.map(d => (
                      <tr key={d.id} className="border-t border-slate-50 hover:bg-slate-25">
                        <td className="px-5 py-2.5 text-slate-700">{d.periodValue}</td>
                        <td className="px-5 py-2.5 text-slate-700">{d.indicatorValue}</td>
                        <td className="px-5 py-2.5 text-slate-500 max-w-[200px] truncate">{d.indicatorText}</td>
                        <td className="px-5 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${DATA_STATUS[d.status as keyof typeof DATA_STATUS]?.cls ?? 'bg-gray-100 text-gray-600'}`}>
                            {DATA_STATUS[d.status as keyof typeof DATA_STATUS]?.label ?? '未知'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              请从左侧选择一个指标查看数据
            </div>
          )}
        </div>
      </div>

      {showDataModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">录入数据 - {selected.indicatorName}</h2>
              <button onClick={() => setShowDataModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-slate-600 mb-1 block">所属组织</label>
                <select className="input-field" value={dataForm.orgId ?? 1} onChange={e => updateDataForm('orgId', Number(e.target.value))}>
                  {organizations.map(org => <option key={org.id} value={org.id}>{org.orgName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-600 mb-1 block">周期类型</label>
                <select className="input-field" value={dataForm.periodType} onChange={e => updateDataForm('periodType', Number(e.target.value))}>
                  {PERIOD_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-600 mb-1 block">周期值</label>
                <input className="input-field" placeholder="如 2024 或 2024-Q1" value={dataForm.periodValue} onChange={e => updateDataForm('periodValue', e.target.value)} />
              </div>
              <div>
                <label className="text-slate-600 mb-1 block">指标值</label>
                <input type="number" className="input-field" value={dataForm.indicatorValue || ''} onChange={e => updateDataForm('indicatorValue', Number(e.target.value))} />
              </div>
              <div>
                <label className="text-slate-600 mb-1 block">定性描述</label>
                <textarea className="input-field" rows={3} placeholder="填写定性描述（可选）" value={dataForm.indicatorText} onChange={e => updateDataForm('indicatorText', e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowDataModal(false)} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">取消</button>
              <button onClick={handleSaveData} className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700">确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
