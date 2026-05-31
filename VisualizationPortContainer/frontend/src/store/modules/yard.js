import { defineStore } from 'pinia'
import { getYardList, getYardLayout, getSlotOccupancy } from '@/api/yard'
import { getSlotList } from '@/api/slot'

export const useYardStore = defineStore('yard', {
  state: () => ({
    yardList: [],
    currentYard: null,
    yardLayout: [],
    slotList: [],
    occupancyData: null,
    viewMode: '2D'
  }),

  actions: {
    async fetchYardList(params) {
      try {
        const res = await getYardList(params)
        this.yardList = res.data.list || res.data
        return res
      } catch (error) {
        throw error
      }
    },

    async fetchYardLayout(yardId) {
      try {
        const res = await getYardLayout(yardId)
        this.yardLayout = res.data
        return res
      } catch (error) {
        throw error
      }
    },

    async fetchSlotList(params) {
      try {
        const res = await getSlotList(params)
        this.slotList = res.data.list || res.data
        return res
      } catch (error) {
        throw error
      }
    },

    async fetchOccupancyData(yardId) {
      try {
        const res = await getSlotOccupancy(yardId)
        this.occupancyData = res.data
        return res
      } catch (error) {
        throw error
      }
    },

    setCurrentYard(yard) {
      this.currentYard = yard
    },

    setViewMode(mode) {
      this.viewMode = mode
    }
  }
})
