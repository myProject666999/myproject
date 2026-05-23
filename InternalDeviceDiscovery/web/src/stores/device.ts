import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Device } from '../types'

export const useDeviceStore = defineStore('device', () => {
  const devices = ref<Device[]>([])
  const total = ref(0)
  const selected = ref<number[]>([])
  const loading = ref(false)

  function setDevices(list: Device[], totalCount: number) {
    devices.value = list
    total.value = totalCount
  }

  function toggleSelect(id: number) {
    const idx = selected.value.indexOf(id)
    if (idx > -1) {
      selected.value.splice(idx, 1)
    } else {
      selected.value.push(id)
    }
  }

  function clearSelection() {
    selected.value = []
  }

  function removeDevice(id: number) {
    const idx = devices.value.findIndex((d) => d.id === id)
    if (idx > -1) {
      devices.value.splice(idx, 1)
      total.value--
    }
  }

  return { devices, total, selected, loading, setDevices, toggleSelect, clearSelection, removeDevice }
})
