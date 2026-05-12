import request from '@/utils/request';

export const auth = {
  login: (data) => request.post('/api/auth/login', data),
  register: (data) => request.post('/api/auth/register', data),
  getProfile: () => request.get('/api/auth/profile'),
  updateProfile: (data) => request.put('/api/auth/profile', data),
};

export const packages = {
  list: (params) => request.get('/api/packages', { params }),
  detail: (id) => request.get(`/api/packages/${id}`),
};

export const workers = {
  list: (params) => request.get('/api/workers', { params }),
  detail: (id) => request.get(`/api/workers/${id}`),
  getSlots: (workerId, date) => request.get(`/api/workers/${workerId}/slots?date=${date}`),
};

export const bookings = {
  create: (data) => request.post('/api/bookings', data),
  list: (params) => request.get('/api/bookings', { params }),
  workerList: (params) => request.get('/api/bookings/worker', { params }),
  detail: (id) => request.get(`/api/bookings/${id}`),
  pay: (id) => request.post(`/api/bookings/${id}/pay`),
  cancel: (id) => request.post(`/api/bookings/${id}/cancel`),
  accept: (id) => request.post(`/api/bookings/${id}/accept`),
  start: (id) => request.post(`/api/bookings/${id}/start`),
  complete: (id) => request.post(`/api/bookings/${id}/complete`),
  rate: (id, data) => request.post(`/api/bookings/${id}/rate`, data),
  getPhotos: (bookingId) => request.get(`/api/bookings/${bookingId}/photos`),
  uploadBeforePhoto: (bookingId, data) => request.post(`/api/bookings/${bookingId}/photos/before`, data),
  uploadAfterPhoto: (bookingId, data) => request.post(`/api/bookings/${bookingId}/photos/after`, data),
};

export const coupons = {
  available: (params) => request.get('/api/coupons/available', { params }),
  claim: (data) => request.post('/api/coupons/claim', data),
  myList: (params) => request.get('/api/coupons/my', { params }),
  usable: (params) => request.get('/api/coupons/usable', { params }),
};

export const salary = {
  workHoursList: (params) => request.get('/api/salary/hours', { params }),
  recordWorkHour: (data) => request.post('/api/salary/hours/record', data),
  salariesList: (params) => request.get('/api/salary/salaries', { params }),
  statistics: () => request.get('/api/salary/statistics'),
  settle: (data) => request.post('/api/salary/settle', data),
  confirmSalary: (id) => request.post(`/api/salary/salaries/${id}/confirm`),
};
