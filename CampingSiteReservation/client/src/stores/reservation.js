import { defineStore } from 'pinia'

export const useReservationStore = defineStore('reservation', {
  state: () => ({
    campsite: null,
    checkinDate: null,
    checkoutDate: null,
    guests: 2,
    selectedEquipments: [],
    selectedActivities: []
  }),
  getters: {
    nights(state) {
      if (!state.checkinDate || !state.checkoutDate) return 0
      const start = new Date(state.checkinDate)
      const end = new Date(state.checkoutDate)
      const diff = end.getTime() - start.getTime()
      return Math.ceil(diff / (1000 * 60 * 60 * 24))
    },
    campsitePrice(state) {
      if (!state.campsite || !this.nights) return 0
      let total = 0
      const start = new Date(state.checkinDate)
      for (let i = 0; i < this.nights; i++) {
        const date = new Date(start)
        date.setDate(date.getDate() + i)
        const dayOfWeek = date.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        total += isWeekend ? state.campsite.weekend_price : state.campsite.price
      }
      return total
    },
    equipmentsPrice(state) {
      return state.selectedEquipments.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
      }, 0)
    },
    activitiesPrice(state) {
      return state.selectedActivities.reduce((sum, item) => {
        return sum + (item.price * item.participants)
      }, 0)
    },
    totalPrice(state) {
      return this.campsitePrice + this.equipmentsPrice + this.activitiesPrice
    }
  },
  actions: {
    setCampsite(campsite) {
      this.campsite = campsite
    },
    setDates(checkin, checkout) {
      this.checkinDate = checkin
      this.checkoutDate = checkout
    },
    setGuests(guests) {
      this.guests = guests
    },
    addEquipment(equipment, quantity = 1) {
      const index = this.selectedEquipments.findIndex(e => e.id === equipment.id)
      if (index > -1) {
        this.selectedEquipments[index].quantity += quantity
      } else {
        this.selectedEquipments.push({
          ...equipment,
          quantity
        })
      }
    },
    removeEquipment(id) {
      const index = this.selectedEquipments.findIndex(e => e.id === id)
      if (index > -1) {
        this.selectedEquipments.splice(index, 1)
      }
    },
    addActivity(activity, participants = 1) {
      const index = this.selectedActivities.findIndex(a => a.id === activity.id)
      if (index > -1) {
        this.selectedActivities[index].participants += participants
      } else {
        this.selectedActivities.push({
          ...activity,
          participants
        })
      }
    },
    removeActivity(id) {
      const index = this.selectedActivities.findIndex(a => a.id === id)
      if (index > -1) {
        this.selectedActivities.splice(index, 1)
      }
    },
    clear() {
      this.campsite = null
      this.checkinDate = null
      this.checkoutDate = null
      this.guests = 2
      this.selectedEquipments = []
      this.selectedActivities = []
    }
  }
})
