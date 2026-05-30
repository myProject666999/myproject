import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, X, History, Layers } from 'lucide-react';
import { generateReport, getReportPage, createNewVersion, getReportHistory, deleteReport } from '@/api/report';
import { getOrganizationTree } from '@/api/organization';
import type { Report, Organization } from '@/types';

const REPORT_TYPE: Record<number, { label: string; cls: string }> = {
  1: { label: '碳排放', cls: 'bg-teal-100 text-teal-700' },
  2: { label: 'ESG', cls: 'bg-amber-100 text-amber-700' },
};

const REPORT_STATUS: Record<number, { label: string; cls: string }> = {
  0: { label: '草稿', cls: 'bg-gray-100 text-gray-600' },
  1: { label: '待审核', cls: 'bg-amber-100 text-amber-700' },
  2: { label: '已发布', cls: 'bg-green-100 text-green-700' },
  3: { label: '已归档', cls: 'bg-blue-100 text-blue-700' },
};

const PERIOD_TYPES = [
  { value: 1, label: '年度' },
  { value: 2, label: '季度' },
  { value: 3, label: '月度' },
];

interface GenerateForm {
  orgId: number;
  reportType: number;
  periodType: number;
  periodValue: string;
  createBy: string;
}

const EMPTY_FORM: GenerateForm = { orgId: 0, reportType: 1, periodType: 1, periodValue: '', createBy: '' };

export default function ReportPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [showGenModal, setShowGenModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyList, setHistoryList] = useState<Report[]>([]);
  const [genForm, setGenForm] = useState<GenerateForm>({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);

  const flattenOrgs = (nodes: Organization[]): Organization[] =>
    nodes.flatMap(n => [n, ...flattenOrgs(n.children ?? [])]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReportPage({ pageNum: 1, pageSize: 100 });
      setReports(res.records);
    } catch { setReports([]); }
    setLoading(false);
  }, []);

  const fetchOrgs = useCallback(async () => {
    try {
      const res = await getOrganizationTree();
      setOrgs(flattenOrgs(res));
    } catch { setOrgs([]); }
  }, []);

  useEffect(() => { fetchReports(); fetchOrgs(); }, [fetchReports, fetchOrgs]);

  const handleGenerate = async () => {
    await generateReport(genForm);
    setShowGenModal(false);
    setGenForm({ ...EMPTY_FORM });
    fetchReports();
  };

  const handleNewVersion = async (reportId: number) => {
    await createNewVersion(reportId, 'system');
    fetchReports();
  };

  const handleViewHistory = async (reportNo: string) => {
    try {
      const res = await getReportHistory(reportNo);
      setHistoryList(res);
      setShowHistoryModal(true);
    } catch { setHistoryList([]); }
  };

  const handleDelete = async (id: number) => {
    await deleteReport(id);
    fetchReports();
  };

  const updateGenForm = (key: keyof GenerateForm, value: unknown) =>
    setGenForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">报告管理</h1>
        <button onClick={() => setShowGenModal(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
          <Plus size={18} />生成报告
        </button>
      </div>

      {loading ? <p className="text-slate-400">加载中...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {reports.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-teal-600" />
                  <h3 className="font-semibold text-slate-800">{r.reportName}</h3>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${REPORT_TYPE[r.reportType as keyof typeof REPORT_TYPE]?.cls ?? ''}`}>
                  {REPORT_TYPE[r.reportType as keyof typeof REPORT_TYPE]?.label}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-500">周期: {r.periodValue}</span>
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">v{r.version}</span>
              </div>

              <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${REPORT_STATUS[r.reportStatus as keyof typeof REPORT_STATUS]?.cls ?? ''}`}>
                {REPORT_STATUS[r.reportStatus as keyof typeof REPORT_STATUS]?.label}
              </span>

              {r.reportType === 1 ? (
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">总排放量</span><span className="font-medium">{r.totalEmission} tCO₂</span></div>
                  <div className="flex justify-between text-xs text-slate-400"><span>范围1</span><span>{r.scope1Emission}</span></div>
                  <div className="flex justify-between text-xs text-slate-400"><span>范围2</span><span>{r.scope2Emission}</span></div>
                  <div className="flex justify-between text-xs text-slate-400"><span>范围3</span><span>{r.scope3Emission}</span></div>
                </div>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">ESG评分</span>
                  <span className="font-medium text-amber-700">{r.esgScore}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button onClick={() => handleViewHistory(r.reportNo)} className="flex items-center gap-1 text-xs px-3 py-1 bg-slate-50 text-slate-600 rounded-md hover:bg-slate-100">
                  <History size={13} />查看历史版本
                </button>
                <button onClick={() => handleNewVersion(r.id)} className="flex items-center gap-1 text-xs px-3 py-1 bg-teal-50 text-teal-700 rounded-md hover:bg-teal-100">
                  <Layers size={13} />新建版本
                </button>
                <button onClick={() => handleDelete(r.id)} className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 ml-auto">删除</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">生成报告</h2>
              <button onClick={() => setShowGenModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-slate-600 mb-1 block">组织</label>
                <select className="input-field" value={genForm.orgId} onChange={e => updateGenForm('orgId', Number(e.target.value))}>
                  <option value={0}>请选择</option>
                  {orgs.map(o => <option key={o.id} value={o.id}>{o.orgName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-600 mb-1 block">报告类型</label>
                <select className="input-field" value={genForm.reportType} onChange={e => updateGenForm('reportType', Number(e.target.value))}>
                  <option value={1}>碳排放报告</option><option value={2}>ESG报告</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 mb-1 block">周期类型</label>
                <select className="input-field" value={genForm.periodType} onChange={e => updateGenForm('periodType', Number(e.target.value))}>
                  {PERIOD_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-600 mb-1 block">周期值</label>
                <input className="input-field" placeholder="如 2024 或 2024-Q1" value={genForm.periodValue} onChange={e => updateGenForm('periodValue', e.target.value)} />
              </div>
              <div>
                <label className="text-slate-600 mb-1 block">创建人</label>
                <input className="input-field" value={genForm.createBy} onChange={e => updateGenForm('createBy', e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowGenModal(false)} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">取消</button>
              <button onClick={handleGenerate} className="px-4 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700">生成</button>
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">版本历史</h2>
              <button onClick={() => setShowHistoryModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {historyList.length === 0 ? (
                <p className="text-center text-slate-400 py-6">暂无历史版本</p>
              ) : historyList.map(v => (
                <div key={v.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <span className="font-medium text-slate-800">v{v.version}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${REPORT_STATUS[v.reportStatus as keyof typeof REPORT_STATUS]?.cls ?? ''}`}>
                      {REPORT_STATUS[v.reportStatus as keyof typeof REPORT_STATUS]?.label}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">{v.updateTime ?? v.createTime}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setShowHistoryModal(false)} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
