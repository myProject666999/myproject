export interface User {
  id: number
  username: string
  realName: string
  email: string
  phone: string
  role: 'admin' | 'manager' | 'inspector'
  department?: string
  avatar?: string
  status: number
  lastLoginTime?: string
  createdAt: string
  updatedAt: string
}

export interface Store {
  id: number
  name: string
  code: string
  province?: string
  city: string
  district: string
  address: string
  longitude?: number
  latitude?: number
  manager?: string
  managerPhone?: string
  area?: string
  status: number
  createdAt: string
  updatedAt: string
}

export interface ChecklistTemplate {
  id: number
  name: string
  description?: string
  type?: string
  category: string
  version: string
  totalScore: number
  passScore: number
  status: number
  creatorId: number
  createdAt: string
  updatedAt: string
  items?: ChecklistItem[]
}

export interface ChecklistItem {
  id: number
  templateId: number
  parentId?: number
  code?: string
  title: string
  description?: string
  category?: string
  type: 'text' | 'select' | 'multiple' | 'boolean' | 'score'
  options?: string[]
  scoreWeight: number
  sortOrder: number
  required: boolean
  needPhoto?: boolean
  scoringStandard?: string
  createdAt: string
  updatedAt: string
}

export interface InspectionTask {
  id: number
  name: string
  templateId: number
  templateName?: string
  storeIds: number[]
  stores?: Store[]
  inspectorIds: number[]
  inspectors?: User[]
  startDate: string
  endDate: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  progress: number
  createdAt: string
  updatedAt: string
}

export interface InspectionRecord {
  id: number
  taskId: number
  storeId: number
  store?: Store
  inspectorId: number
  inspector?: User
  templateId: number
  templateName?: string
  startTime?: string
  endTime?: string
  status: 'pending' | 'in_progress' | 'completed'
  totalScore: number
  passScore: number
  passed: boolean
  remark?: string
  createdAt: string
  updatedAt: string
  items?: InspectionItemRecord[]
  photos?: Photo[]
  issues?: Issue[]
}

export interface InspectionItemRecord {
  id: number
  recordId: number
  itemId: number
  itemTitle?: string
  itemType: string
  value: string
  score: number
  fullScore: number
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface Photo {
  id: number
  recordId: number
  issueId?: number
  url: string
  thumbnailUrl?: string
  type: 'inspection' | 'issue' | 'rectification'
  remark?: string
  uploadedAt: string
}

export interface Issue {
  id: number
  recordId: number
  itemId?: number
  description: string
  level: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'rectifying' | 'resolved' | 'verified'
  deadline?: string
  handlerId?: number
  handler?: User
  createdAt: string
  updatedAt: string
  photos?: Photo[]
  rectifications?: Rectification[]
}

export interface Rectification {
  id: number
  issueId: number
  description: string
  status: 'submitted' | 'approved' | 'rejected'
  submitterId: number
  submitter?: User
  auditorId?: number
  auditor?: User
  remark?: string
  submittedAt: string
  auditedAt?: string
  photos?: Photo[]
}

export interface RectificationStatusLog {
  id: number
  issueId: number
  oldStatus: string
  newStatus: string
  operatorId: number
  operator?: User
  remark?: string
  createdAt: string
}

export interface StoreScore {
  id: number
  storeId: number
  store?: Store
  recordId: number
  templateId: number
  templateName?: string
  score: number
  fullScore: number
  passScore: number
  passed: boolean
  inspectionDate: string
  createdAt: string
}

export interface InspectionReport {
  id: number
  recordId: number
  record?: InspectionRecord
  type: 'summary' | 'detail' | 'issue'
  format: 'pdf' | 'excel' | 'word'
  url: string
  generatedAt: string
}
