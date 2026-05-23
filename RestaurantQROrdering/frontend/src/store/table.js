import { defineStore } from 'pinia'
import { getCurrentTable, bindTable, unbindTable } from '../api/table'

export const useTableStore = defineStore('table', {
  state: () => ({
    currentTable: null
  }),
  
  getters: {
    tableId: (state) => state.currentTable?.id,
    tableNo: (state) => state.currentTable?.tableNo
  },
  
  actions: {
    async loadCurrentTable() {
      try {
        this.currentTable = await getCurrentTable()
      } catch (e) {
        console.error('获取当前桌台失败', e)
      }
    },
    
    async bind(tableNo) {
      await bindTable(tableNo)
      await this.loadCurrentTable()
    },
    
    async unbind() {
      await unbindTable()
      this.currentTable = null
    }
  }
})
