export interface Result<T = any> {
  code: number
  message: string
  data: T
}

export interface PageResult<T = any> {
  total: number
  records: T[]
  current: number
  size: number
}

export interface PageQuery {
  pageNum?: number
  pageSize?: number
  keyword?: string
}

export interface MicroApp {
  id: number
  appCode: string
  appName: string
  description: string
  currentVersion: string
  status: number
  owner: string
  entryUrl: string
  createTime: string
  updateTime: string
}

export interface AppVersion {
  id: number
  appId: number
  version: string
  description: string
  entryUrl: string
  status: number
  publishTime: string
  createTime: string
}

export interface AppDependency {
  id: number
  appId: number
  dependencyAppId: number
  dependencyAppCode: string
  dependencyAppName: string
  minVersion: string
  maxVersion: string
  createTime: string
}

export interface RouteConfig {
  id: number
  appId: number
  appCode: string
  path: string
  name: string
  title: string
  icon: string
  sort: number
  visible: number
  permission: string
  component: string
  parentId: number
  children?: RouteConfig[]
  createTime: string
  updateTime: string
}

export interface RuntimeConfig {
  id: number
  configKey: string
  configValue: string
  configType: string
  description: string
  status: number
  version: number
  scope: string
  appId?: number
  appCode?: string
  createTime: string
  updateTime: string
}

export interface ConfigPublish {
  id: number
  publishNo: string
  publishType: string
  scope: string
  appId?: number
  configIds: number[]
  status: number
  progress: number
  totalCount: number
  successCount: number
  failCount: number
  operator: string
  publishTime: string
  completeTime: string
  createTime: string
}

export interface GrayRelease {
  id: number
  grayNo: string
  appId: number
  appCode: string
  targetVersion: string
  grayType: string
  status: number
  progress: number
  hitCount: number
  totalCount: number
  ruleConfig: string
  operator: string
  startTime: string
  endTime: string
  createTime: string
}

export interface GrayUser {
  id: number
  grayId: number
  userId: string
  userName: string
  createTime: string
}

export interface HealthCheck {
  id: number
  appId: number
  appCode: string
  checkUrl: string
  interval: number
  timeout: number
  healthStatus: number
  responseTime: number
  lastCheckTime: string
  autoOffline: number
  createTime: string
  updateTime: string
}

export interface HealthCheckHistory {
  id: number
  checkId: number
  healthStatus: number
  responseTime: number
  checkTime: string
  errorMessage: string
}

export interface AuditLog {
  id: number
  operation: string
  module: string
  content: string
  operator: string
  ip: string
  createTime: string
}

export interface WebSocketMessage<T = any> {
  type: string
  data: T
  timestamp: number
}
