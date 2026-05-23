import client from './client'
import type { Network } from '../types'

export function getNetworks() {
  return client.get<Network[]>('/scan/networks')
}

export function startScan(cidr: string) {
  return client.post('/scan/start', { cidr })
}

export function stopScan() {
  return client.post('/scan/stop')
}

export function getScanStatus() {
  return client.get('/scan/status')
}

export function getScanStreamUrl() {
  return '/api/scan/stream'
}
