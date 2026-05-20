export interface User {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface BillSplit {
  id?: number
  participantId: number
  participantName?: string
  splitRatio: number
  splitAmount: number
}

export interface Bill {
  id?: number
  title: string
  amount: number
  payerId: number
  payerName?: string
  billDate: string
  remark?: string
  splits: BillSplit[]
  createdAt?: string
  updatedAt?: string
}

export interface Transfer {
  fromUserId: number
  fromUserName: string
  toUserId: number
  toUserName: string
  amount: number
}

export interface TransferPlan {
  totalTransfers: number
  transfers: Transfer[]
}

export interface DebtMatrix {
  users: User[]
  matrix: number[][]
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
