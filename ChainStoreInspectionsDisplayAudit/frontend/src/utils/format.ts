import dayjs from 'dayjs'

export const formatDateTime = (date: string | Date | undefined, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!date) return '-'
  return dayjs(date).format(format)
}

export const formatDate = (date: string | Date | undefined, format: string = 'YYYY-MM-DD'): string => {
  if (!date) return '-'
  return dayjs(date).format(format)
}

export const formatTime = (date: string | Date | undefined, format: string = 'HH:mm:ss'): string => {
  if (!date) return '-'
  return dayjs(date).format(format)
}

export const statusTextMap: Record<string, string> = {
  pending: '待处理',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
  rectifying: '整改中',
  resolved: '已解决',
  verified: '已验证',
  submitted: '已提交',
  approved: '已通过',
  rejected: '已拒绝',
  active: '启用',
  inactive: '禁用'
}

export const getStatusText = (status: string): string => {
  return statusTextMap[status] || status
}

export const levelTextMap: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '严重'
}

export const getLevelText = (level: string): string => {
  return levelTextMap[level] || level
}

export const levelColorMap: Record<string, string> = {
  low: '#52c41a',
  medium: '#faad14',
  high: '#fa8c16',
  critical: '#f5222d'
}

export const getLevelColor = (level: string): string => {
  return levelColorMap[level] || '#8c8c8c'
}

export const statusColorMap: Record<string, string> = {
  pending: '#8c8c8c',
  in_progress: '#1890ff',
  completed: '#52c41a',
  cancelled: '#8c8c8c',
  rectifying: '#fa8c16',
  resolved: '#52c41a',
  verified: '#13c2c2',
  submitted: '#1890ff',
  approved: '#52c41a',
  rejected: '#f5222d',
  active: '#52c41a',
  inactive: '#8c8c8c'
}

export const getStatusColor = (status: string): string => {
  return statusColorMap[status] || '#8c8c8c'
}

export const roleTextMap: Record<string, string> = {
  admin: '管理员',
  manager: '经理',
  inspector: '巡检员'
}

export const getRoleText = (role: string): string => {
  return roleTextMap[role] || role
}

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟${secs}秒`
  }
  if (minutes > 0) {
    return `${minutes}分钟${secs}秒`
  }
  return `${secs}秒`
}
