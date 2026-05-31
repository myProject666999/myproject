import dayjs from 'dayjs'

export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  return dayjs(date).format(format)
}

export function formatTime(time) {
  if (!time) return ''
  return time.substring(0, 5)
}

export function getStatusText(status) {
  const statusMap = {
    0: '待生效',
    1: '已生效',
    2: '已取消',
    3: '已完成',
    4: '已核验'
  }
  return statusMap[status] || '未知'
}

export function getStatusType(status) {
  const typeMap = {
    0: 'info',
    1: 'success',
    2: 'info',
    3: 'success',
    4: 'primary'
  }
  return typeMap[status] || 'info'
}

export function getWarningLevelText(level) {
  const levelMap = {
    1: '低',
    2: '中',
    3: '高'
  }
  return levelMap[level] || '未知'
}

export function getWarningLevelType(level) {
  const typeMap = {
    1: 'success',
    2: 'warning',
    3: 'danger'
  }
  return typeMap[level] || 'info'
}
