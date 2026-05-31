import dayjs from 'dayjs'

export const formatDate = (date) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}

export const formatMoney = (amount) => {
  if (amount === null || amount === undefined || amount === '') return '-'
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
  }).format(amount)
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getInsuranceTypeLabel = (type) => {
  const labels = {
    LIFE: '人寿保险',
    HEALTH: '健康保险',
    AUTO: '汽车保险',
    PROPERTY: '财产保险',
    ACCIDENT: '意外保险',
    EDUCATION: '教育保险',
    PENSION: '养老保险',
  }
  return labels[type] || type
}

export const getInsuranceTypeTag = (type) => {
  const tags = {
    LIFE: 'tag-type-life',
    HEALTH: 'tag-type-health',
    AUTO: 'tag-type-auto',
    PROPERTY: 'tag-type-property',
  }
  return tags[type] || ''
}

export const getPaymentCycleLabel = (cycle) => {
  const labels = {
    MONTHLY: '月缴',
    QUARTERLY: '季缴',
    SEMI_ANNUALLY: '半年缴',
    ANNUALLY: '年缴',
    SINGLE: '趸缴',
  }
  return labels[cycle] || cycle
}

export const getStatusLabel = (status) => {
  const labels = {
    ACTIVE: '有效',
    EXPIRED: '已过期',
    LAPSED: '已失效',
    PENDING: '待处理',
    PAID: '已缴费',
    OVERDUE: '已逾期',
    APPROVED: '已批准',
    REJECTED: '已拒绝',
    SETTLED: '已理赔',
    SENT: '已发送',
    READ: '已阅读',
  }
  return labels[status] || status
}

export const getStatusTag = (status) => {
  const tags = {
    ACTIVE: 'tag-status-active',
    PAID: 'tag-status-paid',
    PENDING: 'tag-status-pending',
    OVERDUE: 'tag-status-overdue',
    EXPIRED: 'tag-status-overdue',
  }
  return tags[status] || ''
}

export const getReminderTypeLabel = (type) => {
  const labels = {
    PAYMENT: '缴费提醒',
    EXPIRY: '到期提醒',
    CLAIM: '理赔提醒',
    OTHER: '其他提醒',
  }
  return labels[type] || type
}

export const getDaysUntil = (date) => {
  if (!date) return 0
  const today = dayjs().startOf('day')
  const target = dayjs(date).startOf('day')
  return target.diff(today, 'day')
}
