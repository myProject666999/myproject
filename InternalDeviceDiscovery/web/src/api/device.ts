import client from './client'
import type { Device, Paged, DeviceQuery, DeviceUpdate } from '../types'

export function listDevices(params: DeviceQuery) {
  return client.get<Paged<Device>>('/devices', { params })
}

export function getDevice(id: number) {
  return client.get<Device>(`/devices/${id}`)
}

export function updateDevice(id: number, data: DeviceUpdate) {
  return client.put(`/devices/${id}`, data)
}

export function deleteDevice(id: number) {
  return client.delete(`/devices/${id}`)
}

export function batchDeleteDevices(ids: number[]) {
  return client.post('/devices/batch-delete', { ids })
}

export function getVendors() {
  return client.get<string[]>('/devices/vendors')
}
