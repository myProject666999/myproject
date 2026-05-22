import request from '../utils/request'

export function getReportList(userId) {
  return request({
    url: '/report/list',
    method: 'get',
    params: { userId }
  })
}

export function getReportDetail(id) {
  return request({
    url: `/report/detail/${id}`,
    method: 'get'
  })
}

export function addReport(data) {
  return request({
    url: '/report/add',
    method: 'post',
    data
  })
}

export function addReportWithIndicators(data) {
  return request({
    url: '/report/addWithIndicators',
    method: 'post',
    data
  })
}

export function updateReport(data) {
  return request({
    url: '/report/update',
    method: 'put',
    data
  })
}

export function deleteReport(id) {
  return request({
    url: `/report/delete/${id}`,
    method: 'delete'
  })
}

export function getAvailableYears(userId) {
  return request({
    url: '/report/years',
    method: 'get',
    params: { userId }
  })
}

export function uploadReportFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/report/upload',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
