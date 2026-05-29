import { get, post } from '@/utils/request'
import type {
  DamageRecord,
  DamageRecordQuery,
  DamageRecordCreate,
  PageResult
} from '@/types'

export function getDamageList(params: DamageRecordQuery) {
  return get<PageResult<DamageRecord>>('/damage', { params })
}

export function createDamageRecord(data: DamageRecordCreate) {
  return post<DamageRecord>('/damage', data)
}
