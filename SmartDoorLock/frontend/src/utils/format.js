import dayjs from 'dayjs'

export function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  return dayjs(date).format(format)
}

export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return ''
  return dayjs(date).format(format)
}

export function formatMoney(amount, digits = 2) {
  if (amount === null || amount === undefined || amount === '') return '0.00'
  return Number(amount).toFixed(digits)
}

export function maskPassword(password) {
  if (!password) return ''
  return password.replace(/./g, '*')
}

export function getStatusTagType(status) {
  const statusMap = {
    'ACTIVE': 'success',
    'VACANT': 'success',
    'PAID': 'success',
    'COMPLETED': 'success',
    'SUCCESS': 'success',
    'OCCUPIED': 'primary',
    'PROCESSING': 'primary',
    'ASSIGNED': 'primary',
    'PENDING': 'warning',
    'UNPAID': 'warning',
    'PARTIAL': 'warning',
    'TEMPORARY': 'warning',
    'MAINTENANCE': 'danger',
    'FAULT': 'danger',
    'EXPIRED': 'info',
    'TERMINATED': 'info',
    'CANCELLED': 'info',
    'OVERDUE': 'danger',
    'FROZEN': 'info',
    'OFFLINE': 'info'
  }
  return statusMap[status] || 'info'
}

export function getStatusText(status, type) {
  const maps = {
    apartment: {
      'VACANT': '空闲',
      'OCCUPIED': '已占用',
      'MAINTENANCE': '维护中',
      'RESERVED': '已预订'
    },
    lease: {
      'PENDING': '待入住',
      'ACTIVE': '执行中',
      'EXPIRED': '已到期',
      'TERMINATED': '已终止'
    },
    password: {
      'ACTIVE': '有效',
      'EXPIRED': '已过期',
      'CANCELLED': '已取消',
      'FROZEN': '已冻结'
    },
    passwordType: {
      'PERMANENT': '永久',
      'TEMPORARY': '临时',
      'DISPOSABLE': '一次性'
    },
    permission: {
      'ADMIN': '管理员',
      'TENANT': '租客',
      'CLEANER': '保洁',
      'MAINTENANCE': '维修',
      'VISITOR': '访客'
    },
    bill: {
      'UNPAID': '待缴费',
      'PARTIAL': '部分缴费',
      'PAID': '已缴清',
      'OVERDUE': '已逾期'
    },
    repair: {
      'PENDING': '待分配',
      'ASSIGNED': '已分配',
      'PROCESSING': '处理中',
      'COMPLETED': '已完成'
    },
    priority: {
      'LOW': '低',
      'MEDIUM': '中',
      'HIGH': '高',
      'URGENT': '紧急'
    },
    lock: {
      'ONLINE': '在线',
      'OFFLINE': '离线',
      'FAULT': '故障'
    },
    send: {
      'PENDING': '发送中',
      'SUCCESS': '发送成功',
      'FAILED': '发送失败'
    }
  }
  return maps[type]?.[status] || status
}

export function getPriorityTagType(priority) {
  const map = {
    'LOW': 'info',
    'MEDIUM': 'primary',
    'HIGH': 'warning',
    'URGENT': 'danger'
  }
  return map[priority] || 'info'
}
