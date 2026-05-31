import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown, Building2, Plus, Save, Trash2 } from 'lucide-react';
import { getOrganizationTree, saveOrganization, updateOrganization, deleteOrganization } from '@/api/organization';
import type { Organization } from '@/types';

const ORG_TYPE: Record<number, { label: string; cls: string }> = {
  1: { label: '集团', cls: 'bg-purple-100 text-purple-700' },
  2: { label: '分公司', cls: 'bg-blue-100 text-blue-700' },
  3: { label: '部门', cls: 'bg-teal-100 text-teal-700' },
};

interface TreeNodeProps {
  node: Organization;
  selectedId: number | null;
  onSelect: (org: Organization) => void;
  expanded: Set<number>;
  toggleExpand: (id: number) => void;
}

function TreeNode({ node, selectedId, onSelect, expanded, toggleExpand }: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);

  return (
    <div className="ml-2">
      <button
        onClick={() => { onSelect(node); if (hasChildren) toggleExpand(node.id); }}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition ${
          selectedId === node.id ? 'bg-teal-50 text-teal-800 border border-teal-200' : 
          node.status === 0 ? 'opacity-50 text-slate-400' : 'hover:bg-slate-50 text-slate-700'
        }`}
      >
        {hasChildren ? (
          isExpanded ? <ChevronDown size={14} className="text-slate-400 shrink-0" /> : <ChevronRight size={14} className="text-slate-400 shrink-0" />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <Building2 size={14} className="text-slate-400 shrink-0" />
        <span className="font-medium truncate">{node.orgName}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full ml-auto shrink-0 ${ORG_TYPE[node.orgType as keyof typeof ORG_TYPE]?.cls ?? 'bg-gray-100 text-gray-600'}`}>
          {ORG_TYPE[node.orgType as keyof typeof ORG_TYPE]?.label ?? '未知'}
        </span>
      </button>
      {hasChildren && isExpanded && (
        <div className="ml-4 border-l border-slate-100">
          {node.children!.map(child => (
            <TreeNode key={child.id} node={child} selectedId={selectedId} onSelect={onSelect} expanded={expanded} toggleExpand={toggleExpand} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizationPage() {
  const [tree, setTree] = useState<Organization[]>([]);
  const [selected, setSelected] = useState<Organization | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [form, setForm] = useState<Partial<Organization>>({});
  const [loading, setLoading] = useState(false);

  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrganizationTree();
      setTree(res);
      const allIds = new Set<number>();
      const collectIds = (nodes: Organization[]) => nodes.forEach(n => { allIds.add(n.id); if (n.children) collectIds(n.children); });
      collectIds(res);
      setExpanded(allIds);
    } catch { setTree([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTree(); }, [fetchTree]);

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectOrg = (org: Organization) => {
    setSelected(org);
    setForm({ ...org });
  };

  const updateForm = (key: keyof Organization, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form) return;
    if (form.id) {
      await updateOrganization(form as Organization);
    } else {
      await saveOrganization(form as Organization);
    }
    fetchTree();
  };

  const handleAddChild = () => {
    if (!selected) return;
    setForm({
      parentId: selected.id,
      orgCode: '',
      orgName: '',
      orgType: 3,
      address: '',
      contactPerson: '',
      contactPhone: '',
      sortOrder: 0,
      status: 1,
    });
  };

  const handleDelete = async () => {
    if (!selected) return;
    await deleteOrganization(selected.id);
    setSelected(null);
    setForm({});
    fetchTree();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">组织管理</h1>

      <div className="flex gap-4 min-h-[560px]">
        <div className="w-72 shrink-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 text-sm font-semibold text-slate-700">
            组织架构
          </div>
          <div className="overflow-y-auto max-h-[510px] p-2">
            {loading ? <p className="text-slate-400 text-sm p-4">加载中...</p> : (
              tree.length === 0 ? <p className="text-slate-400 text-sm p-4">暂无数据</p> :
              tree.map(node => (
                <TreeNode key={node.id} node={node} selectedId={selected?.id ?? null} onSelect={selectOrg} expanded={expanded} toggleExpand={toggleExpand} />
              ))
            )}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden">
          {selected || form.orgName !== undefined ? (
            <>
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">{form.id ? '编辑组织' : '新增子组织'}</h2>
                <div className="flex gap-2">
                  {selected && (
                    <button onClick={handleAddChild} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700">
                      <Plus size={14} />新增子组织
                    </button>
                  )}
                  <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    <Save size={14} />保存
                  </button>
                  {form.id && (
                    <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600">
                      <Trash2 size={14} />删除
                    </button>
                  )}
                </div>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-slate-600 mb-1 block">组织编码</label>
                  <input className="input-field" value={form.orgCode ?? ''} onChange={e => updateForm('orgCode', e.target.value)} />
                </div>
                <div>
                  <label className="text-slate-600 mb-1 block">组织名称</label>
                  <input className="input-field" value={form.orgName ?? ''} onChange={e => updateForm('orgName', e.target.value)} />
                </div>
                <div>
                  <label className="text-slate-600 mb-1 block">组织类型</label>
                  <select className="input-field" value={form.orgType ?? 1} onChange={e => updateForm('orgType', Number(e.target.value))}>
                    <option value={1}>集团</option><option value={2}>分公司</option><option value={3}>部门</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 mb-1 block">排序</label>
                  <input type="number" className="input-field" value={form.sortOrder ?? 0} onChange={e => updateForm('sortOrder', Number(e.target.value))} />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-600 mb-1 block">地址</label>
                  <input className="input-field" value={form.address ?? ''} onChange={e => updateForm('address', e.target.value)} />
                </div>
                <div>
                  <label className="text-slate-600 mb-1 block">联系人</label>
                  <input className="input-field" value={form.contactPerson ?? ''} onChange={e => updateForm('contactPerson', e.target.value)} />
                </div>
                <div>
                  <label className="text-slate-600 mb-1 block">联系电话</label>
                  <input className="input-field" value={form.contactPhone ?? ''} onChange={e => updateForm('contactPhone', e.target.value)} />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-slate-600">状态</label>
                  <button
                    onClick={() => updateForm('status', form.status === 1 ? 0 : 1)}
                    className={`relative w-10 h-5 rounded-full transition ${form.status === 1 ? 'bg-teal-500' : 'bg-slate-300'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition ${form.status === 1 ? 'left-5' : 'left-0.5'}`} />
                  </button>
                  <span className="text-slate-500">{form.status === 1 ? '启用' : '禁用'}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              请从左侧选择一个组织查看详情
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
