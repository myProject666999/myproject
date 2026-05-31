import { defineStore } from 'pinia'
import { tripApi, dayApi, attractionApi, budgetApi } from '../api'

export const useTripStore = defineStore('trip', {
  state: () => ({
    trips: [],
    currentTrip: null,
    loading: false,
    selectedDay: null
  }),

  actions: {
    async fetchTrips() {
      this.loading = true
      try {
        const res = await tripApi.getTrips()
        this.trips = res.data || []
        return this.trips
      } finally {
        this.loading = false
      }
    },

    async fetchTrip(id) {
      this.loading = true
      try {
        const res = await tripApi.getTrip(id)
        this.currentTrip = res.data
        this.sortTripData()
        return this.currentTrip
      } finally {
        this.loading = false
      }
    },

    async createTrip(data) {
      const res = await tripApi.createTrip(data)
      this.trips.unshift(res.data)
      return res.data
    },

    async updateTrip(id, data) {
      const res = await tripApi.updateTrip(id, data)
      const index = this.trips.findIndex(t => t.id === id)
      if (index !== -1) {
        this.trips[index] = res.data
      }
      if (this.currentTrip?.id === id) {
        this.currentTrip = res.data
        this.sortTripData()
      }
      return res.data
    },

    async deleteTrip(id) {
      await tripApi.deleteTrip(id)
      this.trips = this.trips.filter(t => t.id !== id)
      if (this.currentTrip?.id === id) {
        this.currentTrip = null
      }
    },

    sortTripData() {
      if (!this.currentTrip?.days) return
      this.currentTrip.days.sort((a, b) => a.order_index - b.order_index)
      this.currentTrip.days.forEach(day => {
        if (day.attractions) {
          day.attractions.sort((a, b) => a.order_index - b.order_index)
        }
      })
    },

    async createDay(tripId, data) {
      const res = await dayApi.createDay(tripId, data)
      if (this.currentTrip?.id === tripId) {
        this.currentTrip.days.push(res.data)
        this.sortTripData()
      }
      return res.data
    },

    async updateDay(id, data) {
      const res = await dayApi.updateDay(id, data)
      if (this.currentTrip) {
        const day = this.currentTrip.days.find(d => d.id === id)
        if (day) {
          Object.assign(day, res.data)
        }
        this.sortTripData()
      }
      return res.data
    },

    async deleteDay(id) {
      await dayApi.deleteDay(id)
      if (this.currentTrip) {
        this.currentTrip.days = this.currentTrip.days.filter(d => d.id !== id)
      }
    },

    async createAttraction(dayId, data) {
      const res = await attractionApi.createAttraction(dayId, data)
      if (this.currentTrip) {
        const day = this.currentTrip.days.find(d => d.id === dayId)
        if (day) {
          day.attractions = day.attractions || []
          day.attractions.push(res.data)
          day.attractions.sort((a, b) => a.order_index - b.order_index)
        }
      }
      return res.data
    },

    async updateAttraction(id, data) {
      const res = await attractionApi.updateAttraction(id, data)
      if (this.currentTrip) {
        for (const day of this.currentTrip.days) {
          const attr = day.attractions?.find(a => a.id === id)
          if (attr) {
            Object.assign(attr, res.data)
            break
          }
        }
      }
      return res.data
    },

    async deleteAttraction(id) {
      await attractionApi.deleteAttraction(id)
      if (this.currentTrip) {
        for (const day of this.currentTrip.days) {
          if (day.attractions) {
            day.attractions = day.attractions.filter(a => a.id !== id)
          }
        }
      }
    },

    async fetchBudgetSummary(tripId) {
      const res = await budgetApi.getBudgetSummary(tripId)
      return res.data
    },

    async createBudget(tripId, data) {
      const res = await budgetApi.createBudget(tripId, data)
      if (this.currentTrip?.id === tripId) {
        this.currentTrip.budgets = this.currentTrip.budgets || []
        this.currentTrip.budgets.push(res.data)
      }
      return res.data
    },

    async updateBudget(id, data) {
      const res = await budgetApi.updateBudget(id, data)
      if (this.currentTrip) {
        const budget = this.currentTrip.budgets?.find(b => b.id === id)
        if (budget) {
          Object.assign(budget, res.data)
        }
      }
      return res.data
    },

    async deleteBudget(id) {
      await budgetApi.deleteBudget(id)
      if (this.currentTrip) {
        this.currentTrip.budgets = this.currentTrip.budgets.filter(b => b.id !== id)
      }
    }
  }
})
