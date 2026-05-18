import request from '@/api/request'

export const getUserResumes = (userId) => {
  return request({
    url: '/resumes',
    method: 'get',
    params: { userId }
  })
}

export const getPublicResumes = () => {
  return request({
    url: '/resumes/public',
    method: 'get'
  })
}

export const getResumeById = (id) => {
  return request({
    url: `/resumes/${id}`,
    method: 'get'
  })
}

export const createResume = (data) => {
  return request({
    url: '/resumes',
    method: 'post',
    data
  })
}

export const updateResume = (id, data) => {
  return request({
    url: `/resumes/${id}`,
    method: 'put',
    data
  })
}

export const deleteResume = (id) => {
  return request({
    url: `/resumes/${id}`,
    method: 'delete'
  })
}

export const incrementViewCount = (id) => {
  return request({
    url: `/resumes/${id}/view`,
    method: 'post'
  })
}

export const exportResumeToPdf = (id) => {
  return request({
    url: `/resumes/${id}/export-pdf`,
    method: 'get',
    responseType: 'blob'
  })
}
