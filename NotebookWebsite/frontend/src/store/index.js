import { reactive } from 'vue'

export const store = reactive({
  selectedNode: null,

  setSelectedNode(node, type) {
    this.selectedNode = node ? { ...node, type } : null
  },

  clearSelectedNode() {
    this.selectedNode = null
  }
})
