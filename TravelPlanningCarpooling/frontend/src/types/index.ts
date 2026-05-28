export interface User {
  id: number
  phone: string
  nickname: string
  avatar: string
  gender: number
  credit_score: number
  total_rides: number
  completed_rides: number
  role: number
  is_verified: number
  token?: string
}

export interface Vehicle {
  id: number
  owner_id: number
  plate_number: string
  brand: string
  model: string
  color: string
  seats: number
  vehicle_photo: string
  is_verified: number
  created_at: string
  updated_at: string
}

export interface Ride {
  id: number
  owner_id: number
  vehicle_id: number
  departure: string
  departure_lng: number
  departure_lat: number
  destination: string
  destination_lng: number
  destination_lat: number
  departure_time: string
  available_seats: number
  locked_seats: number
  price_per_person: number
  description: string
  status: number
  created_at: string
  updated_at: string
  owner?: User
  vehicle?: Vehicle
  match_score?: number
}

export interface RideRequest {
  id: number
  passenger_id: number
  departure: string
  departure_lng: number
  departure_lat: number
  destination: string
  destination_lng: number
  destination_lat: number
  earliest_time: string
  latest_time: string
  passengers_count: number
  max_price: number
  description: string
  status: number
  created_at: string
  updated_at: string
  passenger?: User
}

export interface Order {
  id: number
  ride_id: number
  request_id?: number
  owner_id: number
  passenger_id: number
  passengers_count: number
  price: number
  pickup_address: string
  dropoff_address: string
  status: number
  owner_confirm_time?: string
  start_time?: string
  complete_time?: string
  cancel_time?: string
  cancel_reason?: string
  created_at: string
  updated_at: string
  ride?: Ride
  owner?: User
  passenger?: User
}

export interface LocationShare {
  id: number
  ride_id: number
  user_id: number
  lng: number
  lat: number
  speed: number
  heading: number
  created_at: string
}

export interface Review {
  id: number
  order_id: number
  ride_id: number
  reviewer_id: number
  reviewee_id: number
  rating: number
  content: string
  tags: string
  created_at: string
  reviewer?: User
  reviewee?: User
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
}

export interface PageResult<T = any> {
  list: T[]
  total: number
  page: number
  page_size: number
}

export const OrderStatus = {
  PENDING: 1,
  CONFIRMED: 2,
  STARTED: 3,
  COMPLETED: 4,
  CANCELLED: 5,
  REJECTED: 6
} as const

export const OrderStatusText: Record<number, string> = {
  1: '待确认',
  2: '已确认',
  3: '已出发',
  4: '已完成',
  5: '已取消',
  6: '已拒绝'
} as const

export const RideStatus = {
  RECRUITING: 1,
  STARTED: 2,
  COMPLETED: 3,
  CANCELLED: 4
} as const

export const RideStatusText: Record<number, string> = {
  1: '招募中',
  2: '已出发',
  3: '已完成',
  4: '已取消'
} as const
