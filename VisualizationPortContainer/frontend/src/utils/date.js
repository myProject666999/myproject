import dayjs from 'dayjs'

export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return ''
  return dayjs(date).format(format)
}

export function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  return dayjs(date).format(format)
}

export function formatTime(date, format = 'HH:mm:ss') {
  if (!date) return ''
  return dayjs(date).format(format)
}

export function getToday(format = 'YYYY-MM-DD') {
  return dayjs().format(format)
}

export function getThisMonth() {
  return dayjs().format('YYYY-MM')
}

export function getDateRange(days) {
  const end = dayjs()
  const start = end.subtract(days, 'day')
  return [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')]
}

export function relativeTime(date) {
  if (!date) return ''
  return dayjs(date).fromNow()
}
