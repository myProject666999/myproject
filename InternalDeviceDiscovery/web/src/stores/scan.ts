import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Device, Network } from '../types'

export const useScanStore = defineStore('scan', () => {
  const scanning = ref(false)
  const progress = ref(0)
  const currentIp = ref('')
  const done = ref(0)
  const total = ref(0)
  const discovered = ref<Device[]>([])
  const networks = ref<Network[]>([])
  const selectedCidr = ref('')
  const error = ref('')
  const summary = ref<{ total: number; newFound: number } | null>(null)

  function reset() {
    scanning.value = false
    progress.value = 0
    currentIp.value = ''
    done.value = 0
    total.value = 0
    discovered.value = []
    error.value = ''
    summary.value = null
  }

  return {
    scanning,
    progress,
    currentIp,
    done,
    total,
    discovered,
    networks,
    selectedCidr,
    error,
    summary,
    reset,
  }
})
