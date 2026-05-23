export interface Device {
  id: number
  ip: string
  mac: string
  vendor: string
  hostname: string | null
  name: string | null
  note: string | null
  status: 'online' | 'offline'
  firstSeenAt: string
  lastSeenAt: string
}

export interface Paged<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ScanEvent {
  type: 'progress' | 'device' | 'finish' | 'error'
  percent?: number
  current?: string
  done?: number
  total?: number
  device?: Device
  summary?: { total: number; newFound: number }
  message?: string
}

export interface Network {
  name: string
  cidr: string
  interface: string
}

export interface DeviceQuery {
  keyword?: string
  status?: 'online' | 'offline' | ''
  vendor?: string
  page?: number
  pageSize?: number
}

export interface DeviceUpdate {
  name?: string | null
  note?: string | null
}
