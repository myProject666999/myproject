import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  error => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export const uploadVCard = (userId, file) => {
  const formData = new FormData()
  formData.append('userId', userId)
  formData.append('file', file)
  return request.post('/contacts/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const getContactList = (userId) => {
  return request.get('/contacts/list', { params: { userId } })
}

export const getVersionList = (userId) => {
  return request.get('/versions/list', { params: { userId } })
}

export const compareVersions = (snapshotId1, snapshotId2) => {
  return request.get('/versions/compare', {
    params: { snapshotId1, snapshotId2 }
  })
}

export const restoreFromSnapshot = (userId, snapshotId) => {
  return request.post(`/contacts/restore/${snapshotId}`, null, {
    params: { userId }
  })
}

export const mergeFromSnapshot = (userId, snapshotId) => {
  return request.post(`/contacts/merge/${snapshotId}`, null, {
    params: { userId }
  })
}

export const deduplicate = (userId) => {
  return request.post('/contacts/deduplicate', null, {
    params: { userId }
  })
}

export const exportContacts = (userId) => {
  window.open(`/api/contacts/export?userId=${userId}`, '_blank')
}

export const exportVersion = (snapshotId) => {
  window.open(`/api/contacts/export-version/${snapshotId}`, '_blank')
}

export default request
