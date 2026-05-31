import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export function formatDate(date: string | Date | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return '-'
  return dayjs(date).format(format)
}

export function formatDateOnly(date: string | Date | number): string {
  return formatDate(date, 'YYYY-MM-DD')
}

export function formatTimeOnly(date: string | Date | number): string {
  return formatDate(date, 'HH:mm:ss')
}

export function formatRelativeTime(date: string | Date | number): string {
  if (!date) return '-'
  return dayjs(date).fromNow()
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return `${minutes}m${seconds}s`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function formatNumber(num: number, decimals: number = 0): string {
  if (num === null || num === undefined || isNaN(num)) return '-'
  return num.toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function formatPercent(value: number, total: number, decimals: number = 2): string {
  if (total === 0) return '0%'
  return `${((value / total) * 100).toFixed(decimals)}%`
}

export function truncate(str: string, maxLength: number = 30, suffix: string = '...'): string {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength) + suffix
}

export function highlight(text: string, keyword: string): string {
  if (!keyword || !text) return text
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}

export function getStatusText(status: number, type: string = 'app'): string {
  const statusMap: Record<string, Record<number, string>> = {
    app: { 0: '下线', 1: '上线', 2: '维护中' },
    config: { 0: '禁用', 1: '启用', 2: '待发布' },
    gray: { 0: '待开始', 1: '进行中', 2: '已暂停', 3: '已全量', 4: '已回滚', 5: '已完成' },
    health: { 0: '异常', 1: '健康', 2: '未知' },
    publish: { 0: '待发布', 1: '发布中', 2: '发布成功', 3: '发布失败', 4: '已取消' },
    version: { 0: '待发布', 1: '已发布', 2: '已归档' }
  }
  return statusMap[type]?.[status] || '未知'
}

export function getStatusType(status: number, type: string = 'app'): string {
  const typeMap: Record<string, Record<number, string>> = {
    app: { 0: 'danger', 1: 'success', 2: 'warning' },
    config: { 0: 'info', 1: 'success', 2: 'warning' },
    gray: { 0: 'info', 1: 'primary', 2: 'warning', 3: 'success', 4: 'danger', 5: 'success' },
    health: { 0: 'danger', 1: 'success', 2: 'warning' },
    publish: { 0: 'info', 1: 'primary', 2: 'success', 3: 'danger', 4: 'info' },
    version: { 0: 'info', 1: 'success', 2: 'info' }
  }
  return typeMap[type]?.[status] || 'info'
}

export function getConfigTypeText(type: string): string {
  const typeMap: Record<string, string> = {
    string: '字符串',
    number: '数字',
    boolean: '布尔值',
    json: 'JSON对象',
    array: '数组'
  }
  return typeMap[type] || type
}

export function getGrayTypeText(type: string): string {
  const typeMap: Record<string, string> = {
    user: '用户灰度',
    percentage: '比例灰度',
    rule: '规则灰度'
  }
  return typeMap[type] || type
}

export function maskSensitive(value: string, type: string = 'default'): string {
  if (!value) return ''
  
  switch (type) {
    case 'phone':
      return value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    case 'email':
      const [name, domain] = value.split('@')
      return `${name.substring(0, 2)}****@${domain}`
    case 'idcard':
      return value.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
    default:
      if (value.length <= 4) return value
      return `${value.substring(0, 2)}****${value.slice(-2)}`
  }
}

export default {
  formatDate,
  formatDateOnly,
  formatTimeOnly,
  formatRelativeTime,
  formatDuration,
  formatFileSize,
  formatNumber,
  formatPercent,
  truncate,
  highlight,
  getStatusText,
  getStatusType,
  getConfigTypeText,
  getGrayTypeText,
  maskSensitive
}
