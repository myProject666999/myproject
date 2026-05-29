export interface BaseModel {
  id: number
  created_at: string
  updated_at: string
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

export interface Container extends BaseModel {
  container_no: string
  name: string
  address: string
  longitude: number
  latitude: number
  area: string
  status: number
  capacity: number
}

export interface ContainerQuery {
  page?: number
  page_size?: number
  keyword?: string
  area?: string
  status?: number
}

export interface ContainerCreate {
  container_no: string
  name: string
  address: string
  longitude: number
  latitude: number
  area: string
  status?: number
  capacity?: number
}

export interface ContainerUpdate {
  name?: string
  address?: string
  longitude?: number
  latitude?: number
  area?: string
  status?: number
  capacity?: number
}

export interface Product extends BaseModel {
  product_code: string
  name: string
  category: string
  price: number
  cost: number
  spec: string
  image_url: string
  status: number
}

export interface ProductQuery {
  page?: number
  page_size?: number
  keyword?: string
  category?: string
  status?: number
}

export interface ProductCreate {
  product_code: string
  name: string
  category: string
  price: number
  cost: number
  spec?: string
  image_url?: string
  status?: number
}

export interface ProductUpdate {
  name?: string
  category?: string
  price?: number
  cost?: number
  spec?: string
  image_url?: string
  status?: number
}

export interface Replenisher extends BaseModel {
  employee_no: string
  name: string
  phone: string
  area: string
  status: number
}

export interface ReplenisherQuery {
  page?: number
  page_size?: number
  keyword?: string
  area?: string
  status?: number
}

export interface ReplenisherCreate {
  employee_no: string
  name: string
  phone: string
  area?: string
  status?: number
}

export interface ReplenisherUpdate {
  name?: string
  phone?: string
  area?: string
  status?: number
}

export interface Inventory extends BaseModel {
  container_id: number
  product_id: number
  quantity: number
  max_quantity: number
  threshold: number
  last_sale_time?: string
  last_replenish_time?: string
  container?: Container
  product?: Product
}

export interface InventoryQuery {
  page?: number
  page_size?: number
  container_id?: number
  product_id?: number
  low_stock?: boolean
}

export interface InventoryCreate {
  container_id: number
  product_id: number
  quantity?: number
  max_quantity?: number
  threshold?: number
}

export interface InventoryUpdate {
  quantity?: number
  max_quantity?: number
  threshold?: number
}

export interface LowStockItem {
  id: number
  container_id: number
  container_no: string
  container_name: string
  area: string
  product_id: number
  product_code: string
  product_name: string
  category: string
  quantity: number
  threshold: number
  max_quantity: number
  need_quantity: number
}

export interface ReplenishmentTask extends BaseModel {
  task_no: string
  replenisher_id?: number
  area: string
  container_count: number
  product_count: number
  total_quantity: number
  status: number
  planned_time?: string
  start_time?: string
  finish_time?: string
  remark: string
  replenisher?: Replenisher
  items?: ReplenishmentTaskItem[]
}

export interface ReplenishmentTaskItem extends BaseModel {
  task_id: number
  container_id: number
  product_id: number
  planned_quantity: number
  actual_quantity?: number
  status: number
  idempotent_key: string
  container?: Container
  product?: Product
}

export interface ReplenishmentTaskQuery {
  page?: number
  page_size?: number
  task_no?: string
  replenisher_id?: number
  area?: string
  status?: number
}

export interface ReplenishmentTaskCreate {
  area: string
  planned_time?: string
  remark?: string
}

export interface ReplenishmentTaskDispatch {
  replenisher_id: number
}

export interface ReplenishmentTaskExecute {
  task_id: number
  items: ReplenishmentTaskItemExecute[]
}

export interface ReplenishmentTaskItemExecute {
  container_id: number
  product_id: number
  actual_quantity: number
}

export interface GenerateTaskRequest {
  area?: string
}

export interface StockCheck extends BaseModel {
  check_no: string
  container_id: number
  replenisher_id: number
  check_time: string
  total_expected: number
  total_actual: number
  total_difference: number
  damage_amount: number
  status: number
  remark: string
  container?: Container
  replenisher?: Replenisher
  items?: StockCheckItem[]
}

export interface StockCheckItem extends BaseModel {
  check_id: number
  product_id: number
  expected_quantity: number
  actual_quantity: number
  difference: number
  unit_price: number
  difference_amount: number
  damage_quantity: number
  damage_reason: string
  product?: Product
}

export interface StockCheckQuery {
  page?: number
  page_size?: number
  check_no?: string
  container_id?: number
  replenisher_id?: number
  start_date?: string
  end_date?: string
  status?: number
}

export interface StockCheckCreate {
  container_id: number
  replenisher_id: number
  check_time: string
  items: StockCheckItemDTO[]
  remark?: string
}

export interface StockCheckItemDTO {
  product_id: number
  expected_quantity?: number
  actual_quantity?: number
  damage_quantity?: number
  damage_reason?: string
}

export interface StockCheckProcess {
  check_id: number
  remark?: string
}

export interface DamageRecord extends BaseModel {
  record_no: string
  container_id: number
  product_id: number
  quantity: number
  unit_price: number
  total_amount: number
  reason: string
  handler_id: number
  handle_time: string
  check_id?: number
  container?: Container
  product?: Product
  handler?: Replenisher
  check?: StockCheck
}

export interface DamageRecordQuery {
  page?: number
  page_size?: number
  record_no?: string
  container_id?: number
  product_id?: number
  start_date?: string
  end_date?: string
}

export interface DamageRecordCreate {
  container_id: number
  product_id: number
  quantity: number
  reason: string
  handler_id: number
  handle_time: string
  check_id?: number
}

export interface Sale extends BaseModel {
  order_no: string
  container_id: number
  product_id: number
  quantity: number
  unit_price: number
  total_amount: number
  pay_method: string
  pay_time?: string
  status: number
  container?: Container
  product?: Product
}

export interface SaleQuery {
  page?: number
  page_size?: number
  container_id?: number
  product_id?: number
  start_date?: string
  end_date?: string
  status?: number
}

export interface SaleCreate {
  order_no: string
  container_id: number
  product_id: number
  quantity: number
  pay_method?: string
}

export interface SaleRefund {
  order_no: string
}

export interface SaleStatistics {
  total_sales: number
  total_orders: number
  total_quantity: number
  average_order: number
}

export interface ContainerSaleStats {
  container_id: number
  container_no: string
  container_name: string
  total_sales: number
  total_quantity: number
  order_count: number
}

export interface ProductSaleStats {
  product_id: number
  product_code: string
  product_name: string
  category: string
  total_sales: number
  total_quantity: number
  order_count: number
}

export interface SalesTrendItem {
  date: string
  sales: number
  orders: number
  quantity: number
}
