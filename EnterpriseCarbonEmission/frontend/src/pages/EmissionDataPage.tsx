import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Upload, Pencil, Trash2, X } from 'lucide-react';
import { getEmissionDataPage, saveEmissionData, deleteEmissionData, batchImportEmissionData, updateEmissionData } from '@/api/emissionData';
import { getCurrentVersionFactors } from '@/api/emissionFactor';
import { getOrganizationList } from '@/api/organization';
import type { EmissionData, EmissionFactor, Organization, PageResult } from '@/types';

const scopeLabels: Record<number, string> = { 1: '范围一', 2: '范围二', 3: '范围三' };
const scopeBadge: Record<number, string> = { 1: 'bg-blue-100 text-blue-700', 2: 'bg-amber-100 text-amber-700', 3: 'bg-purple-100 text-purple-700' };
const sourceLabels: Record<number, string> = { 1: '能源', 2: '差旅', 3: '采购', 4: '生产', 5: '其他' };
const statusLabels: Record<number, string> = { 0: '待审核', 1: '已审核', 2: '已驳回' };
const statusBadge: Record<number, string> = { 0: 'bg-yellow-100 text-yellow-700', 1: 'bg-green-100 text-green-700', 2: 'bg-red-100 text-red-700' };

const emptyForm: Partial<EmissionData> = {
  orgId: undefined, emissionScope: 1, sourceType: 1, activityName: '',
  activityDate: '', quantity: 0, unit: '', factorId: undefined, description: '',
};

export default function EmissionDataPage() {
  const [data, setData] = useState<PageResult<EmissionData>>({ records: [], total: 0, size: 10, current: 1, pages: 0 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ emissionScope: undefined as number | undefined, sourceType: undefined as number | undefined, activityMonth: '' });
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<Partial<EmissionData>>({ ...emptyForm });
  const [editingId, setEditingId] = useState<number | undefined>();
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEmissionDataPage({ emissionScope: filters.emissionScope, sourceType: filters.sourceType, activityMonth: filters.activityMonth || undefined, pageNum: page, pageSize: 10 });
      setData(res);
    } catch { setData({ records: [], total: 0, size: 10, current: 1, pages: 0 }); }
    setLoading(false);
  }, [filters, page]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { getCurrentVersionFactors().then(setFactors).catch(() => {}); }, []);
  useEffect(() => { getOrganizationList().then(setOrgs).catch(() => {}); }, []);

  const handleSave = async () => {
    if (editingId) {
      await updateEmissionData({ ...form, id: editingId } as EmissionData);
    } else {
      await saveEmissionData(form as EmissionData);
    }
    setDrawerOpen(false);
    setForm({ ...emptyForm });
    setEditingId(undefined);
    fetchData();
  };

  const handleEdit = (row: EmissionData) => {
    setForm({ ...row });
    setEditingId(row.id);
    setDrawerOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteEmissionData(id);
    fetchData();
  };

  const handleImport = async (file: File) => {
    await batchImportEmissionData(file, 1, 'admin');
    setImportOpen(false);
    fetchData();
  };

  const openNew = () => {
    setForm({ ...emptyForm });
    setEditingId(undefined);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-end gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500">排放范围</label>
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={filters.emissionScope ?? ''} onChange={e => setFilters(f => ({ ...f, emissionScope: e.target.value ? Number(e.target.value) : undefined }))}>
            <option value="">全部</option>
            {Object.entries(scopeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500">来源类型</label>
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={filters.sourceType ?? ''} onChange={e => setFilters(f => ({ ...f, sourceType: e.target.value ? Number(e.target.value) : undefined }))}>
            <option value="">全部</option>
            {Object.entries(sourceLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500">活动月份</label>
          <input type="month" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={filters.activityMonth} onChange={e => setFilters(f => ({ ...f, activityMonth: e.target.value }))} />
        </div>
        <button onClick={() => { setPage(1); fetchData(); }}
          className="flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition-colors">
          <Search size={16} />查询
        </button>
        <div className="flex-1" />
        <button onClick={openNew}
          className="flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition-colors">
          <Plus size={16} />新增
        </button>
        <button onClick={() => setImportOpen(true)}
          className="flex items-center gap-1 px-4 py-2 border border-teal-600 text-teal-600 rounded-lg text-sm hover:bg-teal-50 transition-colors">
          <Upload size={16} />批量导入
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-left">
              <th className="px-4 py-3 font-medium">数据编号</th>
              <th className="px-4 py-3 font-medium">活动名称</th>
              <th className="px-4 py-3 font-medium">排放范围</th>
              <th className="px-4 py-3 font-medium">来源类型</th>
              <th className="px-4 py-3 font-medium">数量/单位</th>
              <th className="px-4 py-3 font-medium">活动日期</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t border-slate-100"><td colSpan={8} className="px-4 py-4"><div className="h-5 bg-slate-100 rounded animate-pulse" /></td></tr>
            )) : data.records.map(row => (
              <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-600">{row.dataNo}</td>
                <td className="px-4 py-3 text-slate-800 font-medium">{row.activityName}</td>
                <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${scopeBadge[row.emissionScope] ?? ''}`}>{scopeLabels[row.emissionScope]}</span></td>
                <td className="px-4 py-3 text-slate-600">{sourceLabels[row.sourceType] ?? row.sourceType}</td>
                <td className="px-4 py-3 text-slate-600">{row.quantity} {row.unit}</td>
                <td className="px-4 py-3 text-slate-600">{row.activityDate}</td>
                <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[row.status] ?? ''}`}>{statusLabels[row.status]}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(row)} className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-teal-600 transition-colors"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(row.id)} className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <span className="text-xs text-slate-500">共 {data.total} 条</span>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 rounded text-xs border border-slate-200 disabled:opacity-40 hover:bg-slate-50">上一页</button>
            <span className="px-3 py-1 text-xs text-slate-600">{page} / {data.pages || 1}</span>
            <button disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 rounded text-xs border border-slate-200 disabled:opacity-40 hover:bg-slate-50">下一页</button>
          </div>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white shadow-xl h-full overflow-y-auto animate-[slideIn_0.2s_ease-out]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">{editingId ? '编辑数据' : '新增数据'}</h3>
              <button onClick={() => setDrawerOpen(false)} className="p-1 rounded hover:bg-slate-100 text-slate-400"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">组织</label>
                <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={form.orgId ?? ''} onChange={e => setForm(f => ({ ...f, orgId: Number(e.target.value) }))}>
                  <option value="">请选择</option>
                  {orgs.map(o => <option key={o.id} value={o.id}>{o.orgName}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">排放范围</label>
                <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={form.emissionScope ?? 1} onChange={e => setForm(f => ({ ...f, emissionScope: Number(e.target.value) }))}>
                  {Object.entries(scopeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">来源类型</label>
                <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={form.sourceType ?? 1} onChange={e => setForm(f => ({ ...f, sourceType: Number(e.target.value) }))}>
                  {Object.entries(sourceLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">活动名称</label>
                <input type="text" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={form.activityName ?? ''} onChange={e => setForm(f => ({ ...f, activityName: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">活动日期</label>
                <input type="date" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={form.activityDate ?? ''} onChange={e => setForm(f => ({ ...f, activityDate: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500">数量</label>
                  <input type="number" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={form.quantity ?? 0} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500">单位</label>
                  <input type="text" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={form.unit ?? ''} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">排放因子</label>
                <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={form.factorId ?? ''} onChange={e => setForm(f => ({ ...f, factorId: Number(e.target.value) }))}>
                  <option value="">请选择</option>
                  {factors.map(f => <option key={f.id} value={f.id}>{f.factorName} ({f.totalFactor} {f.unit})</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">描述</label>
                <textarea rows={3} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex gap-3 justify-end">
              <button onClick={() => setDrawerOpen(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">取消</button>
              <button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700">保存</button>
            </div>
          </div>
        </div>
      )}

      {importOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setImportOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">批量导入</h3>
              <button onClick={() => setImportOpen(false)} className="p-1 rounded hover:bg-slate-100 text-slate-400"><X size={20} /></button>
            </div>
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragOver ? 'border-teal-500 bg-teal-50' : 'border-slate-300'}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleImport(file); }}>
              <Upload size={32} className="mx-auto text-slate-400 mb-3" />
              <p className="text-sm text-slate-600">拖拽文件到此处，或</p>
              <label className="mt-2 inline-block px-4 py-2 bg-teal-600 text-white rounded-lg text-sm cursor-pointer hover:bg-teal-700">
                选择文件
                <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={e => { const file = e.target.files?.[0]; if (file) handleImport(file); }} />
              </label>
              <p className="text-xs text-slate-400 mt-3">支持 .xlsx .xls .csv 格式</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
