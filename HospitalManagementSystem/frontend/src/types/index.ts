export interface Role {
  id: number
  name: string
  description: string
}

export interface User {
  id: number
  username: string
  name: string
  role_id: number
  department_id: number | null
  phone: string
  email: string
  status: number
  role?: Role
}

export interface Department {
  id: number
  name: string
  code: string
  type: number
  description: string
  status: number
}

export interface RegistrationLevel {
  id: number
  name: string
  price: number
  description: string
  status: number
}

export interface SettlementCategory {
  id: number
  name: string
  description: string
  status: number
}

export interface Medicine {
  id: number
  code: string
  name: string
  generic_name: string
  specification: string
  unit: string
  price: number
  manufacturer: string
  stock: number
  type: number
  pinyin_code: string
  status: number
}

export interface DiagnosisCatalog {
  id: number
  code: string
  name: string
  pinyin_code: string
  description: string
  status: number
}

export interface ChargeItem {
  id: number
  code: string
  name: string
  price: number
  category: string
  pinyin_code: string
  description: string
  status: number
}

export interface DoctorSchedule {
  id: number
  doctor_id: number
  department_id: number
  date: string
  shift: number
  registration_level_id: number | null
  max_patients: number
  current_patients: number
  status: number
  doctor?: User
  department?: Department
  registration_level?: RegistrationLevel
}

export interface Patient {
  id: number
  medical_record_no: string
  name: string
  gender: number
  birth_date: string
  id_card: string
  phone: string
  address: string
  allergy_history: string
}

export interface Registration {
  id: number
  registration_no: string
  patient_id: number
  schedule_id: number
  doctor_id: number
  department_id: number
  registration_level_id: number
  settlement_category_id: number | null
  fee: number
  status: number
  queue_number: number
  registered_at: string
  seen_at: string | null
  finished_at: string | null
  patient?: Patient
  doctor?: User
  department?: Department
  registration_level?: RegistrationLevel
  settlement_category?: SettlementCategory
}

export interface MedicalRecord {
  id: number
  registration_id: number
  patient_id: number
  doctor_id: number
  chief_complaint: string
  present_illness: string
  past_medical_history: string
  physical_examination: string
  auxiliary_examination: string
  diagnosis: string
  treatment_advice: string
}

export interface PrescriptionItem {
  id: number
  prescription_id: number
  medicine_id: number
  medicine_name: string
  specification: string
  quantity: number
  unit: string
  price: number
  dosage: string
  usage_info: string
  medicine?: Medicine
}

export interface Prescription {
  id: number
  prescription_no: string
  registration_id: number
  patient_id: number
  doctor_id: number
  department_id: number
  type: number
  status: number
  dispensed_at: string | null
  dispensed_by: number | null
  items?: PrescriptionItem[]
  patient?: Patient
  doctor?: User
}

export interface FeeItem {
  id: number
  registration_id: number
  patient_id: number
  item_type: number
  item_id: number
  item_name: string
  quantity: number
  unit_price: number
  total_price: number
  settlement_category_id: number | null
  status: number
  created_at: string
}

export interface WorkloadStatistic {
  id: number
  doctor_id: number
  department_id: number
  date: string
  total_patients: number
  total_income: number
  prescription_count: number
  examination_count: number
  laboratory_count: number
  treatment_count: number
  doctor?: User
  department?: Department
}

export interface DailySettlement {
  id: number
  settlement_no: string
  settlement_date: string
  operator_id: number
  total_registration_count: number
  total_registration_income: number
  total_charge_count: number
  total_charge_income: number
  total_income: number
  status: number
  created_at: string
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

export type RoleType = 'admin' | 'doctor' | 'technician' | 'pharmacy' | 'reception'

export const ROLE_MAP: Record<number, RoleType> = {
  1: 'admin',
  2: 'doctor',
  3: 'technician',
  4: 'pharmacy',
  5: 'reception',
}

export const ROLE_NAME_MAP: Record<RoleType, string> = {
  admin: '管理员',
  doctor: '医生',
  technician: '医技医生',
  pharmacy: '药房',
  reception: '挂号收费',
}
