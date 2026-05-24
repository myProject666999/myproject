import request from '../utils/request'

export const getCategories = () => {
  return request({
    url: '/categories',
    method: 'get'
  })
}

export const submitComplaint = (formData) => {
  return request({
    url: '/complaints',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const getMyComplaints = (phone) => {
  return request({
    url: '/complaints/my',
    method: 'get',
    params: { phone }
  })
}

export const getComplaintDetail = (id) => {
  return request({
    url: `/complaints/${id}`,
    method: 'get'
  })
}

export const evaluateComplaint = (id, rating, feedback) => {
  return request({
    url: `/complaints/${id}/evaluate`,
    method: 'post',
    data: { rating, feedback }
  })
}

export const getAllComplaints = (status) => {
  return request({
    url: '/admin/complaints',
    method: 'get',
    params: { status }
  })
}

export const updateComplaintStatus = (id, data) => {
  return request({
    url: `/admin/complaints/${id}/status`,
    method: 'put',
    data
  })
}

export const getStatistics = () => {
  return request({
    url: '/statistics',
    method: 'get'
  })
}

export const downloadFile = (fileId) => {
  return `/api/files/${fileId}`
}
