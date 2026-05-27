import request from '../utils/request'

export const authApi = {
  login: (data) => request.post('/auth/login', data),
  register: (data) => request.post('/auth/register', data),
  getUserInfo: () => request.get('/auth/userinfo'),
}

export const jobApi = {
  getJobList: (params) => request.get('/jobs', { params }),
  getJobDetail: (id) => request.get(`/jobs/${id}`),
  getHotJobs: () => request.get('/jobs/hot'),
  publishJob: (data) => request.post('/jobs', data),
  updateJobStatus: (id, status) => request.put(`/jobs/${id}/status`, { status }),
  getMyJobs: () => request.get('/jobs/my'),
}

export const resumeApi = {
  getMyResume: () => request.get('/resumes/my'),
  updateMyResume: (data) => request.put('/resumes/my', data),
  getResumeByApplicationId: (applicationId) => request.get(`/resumes/application/${applicationId}`),
  searchResumes: (params) => request.get('/resumes/search', { params }),
}

export const applicationApi = {
  applyJob: (jobId) => request.post('/applications', { jobId }),
  getMyApplications: () => request.get('/applications/my'),
  getReceivedApplications: () => request.get('/applications/received'),
  updateApplicationStatus: (id, status) => request.put(`/applications/${id}/status`, { status }),
}

export const companyApi = {
  getMyCompany: () => request.get('/companies/my'),
  updateCompany: (data) => request.put('/companies/my', data),
  getCompanyDetail: (id) => request.get(`/companies/${id}`),
}

export const notificationApi = {
  getNotifications: () => request.get('/notifications'),
  markAsRead: (id) => request.put(`/notifications/${id}/read`),
  markAllAsRead: () => request.put('/notifications/read-all'),
  getUnreadCount: () => request.get('/notifications/unread-count'),
}
