import { useCanvas } from '@/store/canvas'

export default function PropertyPanel() {
  const nodes = useCanvas((s) => s.nodes)
  const edges = useCanvas((s) => s.edges)
  const selectedIds = useCanvas((s) => s.selectedIds)
  const updateNode = useCanvas((s) => s.updateNode)
  const deleteNode = useCanvas((s) => s.deleteNode)
  const updateEdge = useCanvas((s) => s.updateEdge)
  const deleteEdge = useCanvas((s) => s.deleteEdge)

  const selectedNode = nodes.find((n) => selectedIds.includes(n.id) && edges.find((e) => e.id !== n.id))
  const selectedEdge = edges.find((e) => selectedIds.includes(e.id))
  const selected = selectedNode || selectedEdge

  if (!selected) {
    return (
      <aside className="w-72 shrink-0 h-full bg-white border-l border-slate-200 p-4 text-sm text-slate-500">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">属性</h3>
        <p className="text-xs">选中一个形状或连线以查看属性。</p>
        <div className="mt-6 p-3 bg-slate-50 rounded-md text-xs leading-relaxed">
          <p className="font-semibold text-slate-700 mb-1">快捷键</p>
          <p>双击形状：编辑文字</p>
          <p>Delete：删除选中</p>
          <p>Ctrl+Z：撤销</p>
          <p>Ctrl+Y：重做</p>
        </div>
      </aside>
    )
  }

  if (selectedEdge) {
    return (
      <aside className="w-72 shrink-0 h-full bg-white border-l border-slate-200 p-4 space-y-3 overflow-auto">
        <h3 className="text-sm font-semibold text-slate-800">连线属性</h3>
        <label className="block text-xs text-slate-600">
          <span className="mb-1 block">标签</span>
          <input
            className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
            value={selectedEdge.label || ''}
            onChange={(e) => updateEdge(selectedEdge.id, { label: e.target.value })}
          />
        </label>
        <label className="block text-xs text-slate-600">
          <span className="mb-1 block">样式</span>
          <select
            className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
            value={selectedEdge.style || 'solid'}
            onChange={(e) =>
              updateEdge(selectedEdge.id, { style: e.target.value as 'solid' | 'dashed' })
            }
          >
            <option value="solid">实线</option>
            <option value="dashed">虚线</option>
          </select>
        </label>
        <button
          onClick={() => deleteEdge(selectedEdge.id)}
          className="w-full px-3 py-1.5 text-sm bg-rose-50 text-rose-600 hover:bg-rose-100 rounded"
        >
          删除连线
        </button>
      </aside>
    )
  }

  const node = selectedNode!
  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label className="block text-xs text-slate-600">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  )

  return (
    <aside className="w-72 shrink-0 h-full bg-white border-l border-slate-200 p-4 space-y-3 overflow-auto">
      <h3 className="text-sm font-semibold text-slate-800">形状属性</h3>
      <Field label="文字">
        <textarea
          className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
          rows={3}
          value={node.text}
          onChange={(e) => updateNode(node.id, { text: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="X">
          <input
            type="number"
            className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
            value={Math.round(node.x)}
            onChange={(e) => updateNode(node.id, { x: Number(e.target.value) })}
          />
        </Field>
        <Field label="Y">
          <input
            type="number"
            className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
            value={Math.round(node.y)}
            onChange={(e) => updateNode(node.id, { y: Number(e.target.value) })}
          />
        </Field>
        <Field label="宽度">
          <input
            type="number"
            className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
            value={Math.round(node.width)}
            onChange={(e) => updateNode(node.id, { width: Number(e.target.value) })}
          />
        </Field>
        <Field label="高度">
          <input
            type="number"
            className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
            value={Math.round(node.height)}
            onChange={(e) => updateNode(node.id, { height: Number(e.target.value) })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="填充">
          <input
            type="color"
            className="w-full h-8 border border-slate-300 rounded"
            value={node.fill}
            onChange={(e) => updateNode(node.id, { fill: e.target.value })}
          />
        </Field>
        <Field label="描边">
          <input
            type="color"
            className="w-full h-8 border border-slate-300 rounded"
            value={node.stroke}
            onChange={(e) => updateNode(node.id, { stroke: e.target.value })}
          />
        </Field>
        <Field label="文字色">
          <input
            type="color"
            className="w-full h-8 border border-slate-300 rounded"
            value={node.color}
            onChange={(e) => updateNode(node.id, { color: e.target.value })}
          />
        </Field>
        <Field label="字体大小">
          <input
            type="number"
            className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
            value={node.fontSize}
            onChange={(e) => updateNode(node.id, { fontSize: Number(e.target.value) })}
          />
        </Field>
        <Field label="描边宽度">
          <input
            type="number"
            className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
            step={0.5}
            value={node.strokeWidth}
            onChange={(e) => updateNode(node.id, { strokeWidth: Number(e.target.value) })}
          />
        </Field>
      </div>
      <button
        onClick={() => deleteNode(node.id)}
        className="w-full px-3 py-1.5 text-sm bg-rose-50 text-rose-600 hover:bg-rose-100 rounded"
      >
        删除形状
      </button>
    </aside>
  )
}
