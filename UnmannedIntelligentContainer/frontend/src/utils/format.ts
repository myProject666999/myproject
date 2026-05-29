export function padZero(num: number, len = 2): string {
  return num.toString().padStart(len, '0')
}

export function formatDate(date: string | Date | number, format = 'YYYY-MM-DD'): string {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = padZero(d.getMonth() + 1)
  const day = padZero(d.getDate())
  const hours = padZero(d.getHours())
  const minutes = padZero(d.getMinutes())
  const seconds = padZero(d.getSeconds())
  
  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

export function formatDateTime(date: string | Date | number): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss')
}

export function formatDateShort(date: string | Date | number): string {
  return formatDate(date, 'YYYY-MM-DD')
}

export function formatTime(date: string | Date | number): string {
  return formatDate(date, 'HH:mm:ss')
}

export function formatCurrency(
  value: number,
  currency = 'CNY',
  minimumFractionDigits = 2,
  maximumFractionDigits = 2
): string {
  if (value === null || value === undefined || isNaN(value)) return '-'
  
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value)
}

export function formatCurrencyNoSymbol(
  value: number,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2
): string {
  if (value === null || value === undefined || isNaN(value)) return '-'
  
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value)
}

export function formatNumber(
  value: number,
  minimumFractionDigits = 0,
  maximumFractionDigits = 0
): string {
  if (value === null || value === undefined || isNaN(value)) return '-'
  
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value)
}

export function formatPercent(
  value: number,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2
): string {
  if (value === null || value === undefined || isNaN(value)) return '-'
  
  return `${(value * 100).toFixed(minimumFractionDigits)}%`
}

export function formatStatus(status: number, statusMap: Record<number, { label: string; type: string }>): { label: string; type: string } {
  return statusMap[status] || { label: '未知', type: 'info' }
}

export function getDaysInRange(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getRelativeTime(date: string | Date | number): string {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < month) {
    return `${Math.floor(diff / week)}周前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  } else {
    return `${Math.floor(diff / year)}年前`
  }
}
