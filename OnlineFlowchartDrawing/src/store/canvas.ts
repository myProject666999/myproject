import { create } from 'zustand'
import type { Edge, ShapeNode, ShapeType, PortPosition } from '@/types'
import { getDefaultPorts } from '@/lib/ports'

interface CanvasState {
  projectId: string
  projectName: string
  nodes: ShapeNode[]
  edges: Edge[]
  selectedIds: string[]
  history: { nodes: ShapeNode[]; edges: Edge[] }[]
  historyIndex: number
  draft: {
    sourceId: string | null
    sourcePort: PortPosition
    mouseX: number
    mouseY: number
  } | null
  edgeDrag: {
    edgeId: string
    isSource: boolean
    mouseX: number
    mouseY: number
  } | null
  setProject: (id: string, name: string, nodes: ShapeNode[], edges: Edge[]) => void
  setProjectName: (name: string) => void
  load: (nodes: ShapeNode[], edges: Edge[]) => void
  addNode: (type: ShapeType, x: number, y: number) => void
  updateNode: (id: string, patch: Partial<ShapeNode>) => void
  deleteNode: (id: string) => void
  select: (ids: string[]) => void
  startEdge: (sourceId: string, sourcePort: PortPosition, x: number, y: number) => void
  moveEdgeDraft: (x: number, y: number) => void
  finishEdge: (targetId: string | null, targetPort: PortPosition | null) => void
  startEdgeDrag: (edgeId: string, isSource: boolean, x: number, y: number) => void
  moveEdgeDrag: (x: number, y: number) => void
  finishEdgeDrag: (targetNodeId: string | null, targetPort: PortPosition | null) => void
  updateEdge: (id: string, patch: Partial<Edge>) => void
  deleteEdge: (id: string) => void
  undo: () => void
  redo: () => void
  pushHistory: () => void
}

let counter = 1
const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${counter++}`

export const useCanvas = create<CanvasState>((set, get) => ({
  projectId: '',
  projectName: '未命名项目',
  nodes: [],
  edges: [],
  selectedIds: [],
  history: [],
  historyIndex: -1,
  draft: null,
  edgeDrag: null,

  setProject: (id, name, nodes, edges) =>
    set({ projectId: id, projectName: name, nodes, edges, history: [{ nodes, edges }], historyIndex: 0 }),

  setProjectName: (name) => set({ projectName: name }),

  load: (nodes, edges) => set({ nodes, edges }),

  addNode: (type, x, y) => {
    const width = type === 'diamond' ? 140 : 160
    const height = type === 'diamond' ? 80 : 60
    const defaults: Record<string, Partial<ShapeNode>> = {
      rect: { fill: '#EEF2FF', stroke: '#4F46E5', color: '#1E1B4B' },
      ellipse: { fill: '#E0F2FE', stroke: '#0284C7', color: '#0C4A6E' },
      diamond: { fill: '#FEF3C7', stroke: '#F59E0B', color: '#78350F' },
      parallelogram: { fill: '#FCE7F3', stroke: '#DB2777', color: '#831843' },
      hexagon: { fill: '#EDE9FE', stroke: '#7C3AED', color: '#4C1D95' },
      note: { fill: '#FEF9C3', stroke: '#CA8A04', color: '#713F12' },
      actor: { fill: '#F1F5F9', stroke: '#0F172A', color: '#0F172A' },
      entity: { fill: '#FCE7F3', stroke: '#DB2777', color: '#831843' },
      usecase: { fill: '#E0F2FE', stroke: '#0284C7', color: '#0C4A6E' },
      document: { fill: '#FEF3C7', stroke: '#F59E0B', color: '#78350F' },
      database: { fill: '#DCFCE7', stroke: '#16A34A', color: '#14532D' },
    }
    const base = defaults[type] || {}
    const node: ShapeNode = {
      id: uid('n'),
      type,
      x,
      y,
      width,
      height,
      text: '节点',
      fill: '#FFFFFF',
      stroke: '#000000',
      strokeWidth: 1.5,
      fontSize: 14,
      color: '#111111',
      ...base,
    }
    const nodes = [...get().nodes, node]
    set({ nodes })
    get().pushHistory()
  },

  updateNode: (id, patch) => {
    const nodes = get().nodes.map((n) => (n.id === id ? { ...n, ...patch } : n))
    set({ nodes })
  },

  deleteNode: (id) => {
    const nodes = get().nodes.filter((n) => n.id !== id)
    const edges = get().edges.filter((e) => e.source !== id && e.target !== id)
    set({ nodes, edges, selectedIds: get().selectedIds.filter((s) => s !== id) })
    get().pushHistory()
  },

  select: (ids) => set({ selectedIds: ids }),

  startEdge: (sourceId, sourcePort, x, y) => set({ draft: { sourceId, sourcePort, mouseX: x, mouseY: y } }),
  moveEdgeDraft: (x, y) => set((s) => (s.draft ? { draft: { ...s.draft, mouseX: x, mouseY: y } } : s)),
  finishEdge: (targetId, targetPort) => {
    const s = get()
    if (s.draft?.sourceId && targetId && s.draft.sourceId !== targetId && targetPort) {
      const edge: Edge = {
        id: uid('e'),
        source: s.draft.sourceId,
        target: targetId,
        sourcePort: s.draft.sourcePort,
        targetPort,
        label: '',
        style: 'solid',
      }
      set({ edges: [...s.edges, edge], draft: null })
      get().pushHistory()
    } else {
      set({ draft: null })
    }
  },

  startEdgeDrag: (edgeId, isSource, x, y) => set({ edgeDrag: { edgeId, isSource, mouseX: x, mouseY: y } }),
  moveEdgeDrag: (x, y) => set((s) => (s.edgeDrag ? { edgeDrag: { ...s.edgeDrag, mouseX: x, mouseY: y } } : s)),
  finishEdgeDrag: (targetNodeId, targetPort) => {
    const s = get()
    if (!s.edgeDrag || !targetNodeId || !targetPort) {
      set({ edgeDrag: null })
      return
    }
    
    const edge = s.edges.find((e) => e.id === s.edgeDrag!.edgeId)
    if (!edge) {
      set({ edgeDrag: null })
      return
    }
    
    if (s.edgeDrag.isSource) {
      if (targetNodeId === edge.target) {
        set({ edgeDrag: null })
        return
      }
      const targetNode = s.nodes.find((n) => n.id === edge.target)
      const newSourceNode = s.nodes.find((n) => n.id === targetNodeId)
      if (targetNode && newSourceNode) {
        const ports = getDefaultPorts(newSourceNode, targetNode)
        set({
          edges: s.edges.map((e) => 
            e.id === s.edgeDrag!.edgeId 
              ? { ...e, source: targetNodeId, sourcePort: ports.sourcePort } 
              : e
          ),
          edgeDrag: null,
        })
        get().pushHistory()
      }
    } else {
      if (targetNodeId === edge.source) {
        set({ edgeDrag: null })
        return
      }
      const sourceNode = s.nodes.find((n) => n.id === edge.source)
      const newTargetNode = s.nodes.find((n) => n.id === targetNodeId)
      if (sourceNode && newTargetNode) {
        const ports = getDefaultPorts(sourceNode, newTargetNode)
        set({
          edges: s.edges.map((e) => 
            e.id === s.edgeDrag!.edgeId 
              ? { ...e, target: targetNodeId, targetPort: ports.targetPort } 
              : e
          ),
          edgeDrag: null,
        })
        get().pushHistory()
      }
    }
  },

  updateEdge: (id, patch) => {
    const edges = get().edges.map((e) => (e.id === id ? { ...e, ...patch } : e))
    set({ edges })
  },

  deleteEdge: (id) => {
    set({ edges: get().edges.filter((e) => e.id !== id) })
    get().pushHistory()
  },

  pushHistory: () => {
    const s = get()
    const snapshot = { nodes: JSON.parse(JSON.stringify(s.nodes)), edges: JSON.parse(JSON.stringify(s.edges)) }
    const trimmed = s.history.slice(0, s.historyIndex + 1)
    trimmed.push(snapshot)
    set({ history: trimmed, historyIndex: trimmed.length - 1 })
  },

  undo: () => {
    const s = get()
    if (s.historyIndex > 0) {
      const idx = s.historyIndex - 1
      const snap = s.history[idx]
      set({ nodes: snap.nodes, edges: snap.edges, historyIndex: idx })
    }
  },

  redo: () => {
    const s = get()
    if (s.historyIndex < s.history.length - 1) {
      const idx = s.historyIndex + 1
      const snap = s.history[idx]
      set({ nodes: snap.nodes, edges: snap.edges, historyIndex: idx })
    }
  },
}))
