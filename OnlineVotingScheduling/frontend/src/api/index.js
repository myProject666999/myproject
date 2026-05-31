import request from '../utils/request'

export const authApi = {
  login: (data) => request.post('/auth/login', data),
  register: (data) => request.post('/auth/register', data)
}

export const userApi = {
  getCurrent: () => request.get('/users/me'),
  getById: (id) => request.get(`/users/${id}`),
  getAll: () => request.get('/users'),
  update: (id, data) => request.put(`/users/${id}`, data),
  changeStatus: (id, status) => request.put(`/users/${id}/status`, null, { params: { status } })
}

export const teamApi = {
  getAll: () => request.get('/teams'),
  getById: (id) => request.get(`/teams/${id}`),
  getMyTeams: () => request.get('/teams/my'),
  create: (data) => request.post('/teams', data),
  update: (id, data) => request.put(`/teams/${id}`, data),
  getMembers: (id) => request.get(`/teams/${id}/members`),
  addMember: (teamId, userId) => request.post(`/teams/${teamId}/members/${userId}`),
  removeMember: (teamId, userId) => request.delete(`/teams/${teamId}/members/${userId}`)
}

export const availableTimeApi = {
  getByTeam: (teamId) => request.get(`/available-times/team/${teamId}`),
  getMyByTeam: (teamId) => request.get(`/available-times/team/${teamId}/my`),
  getByTeamAndWeekDay: (teamId, weekDay) => request.get(`/available-times/team/${teamId}/weekday/${weekDay}`),
  saveMy: (teamId, data) => request.post(`/available-times/team/${teamId}/my`, data)
}

export const scheduleApi = {
  getByTeam: (teamId) => request.get(`/schedules/team/${teamId}`),
  getByTeamAndStatus: (teamId, status) => request.get(`/schedules/team/${teamId}/status/${status}`),
  getById: (id) => request.get(`/schedules/${id}`),
  create: (data) => request.post('/schedules', data),
  update: (id, data) => request.put(`/schedules/${id}`, data),
  generateSlots: (id, startTime, endTime) =>
    request.post(`/schedules/${id}/generate-slots`, null, { params: { startTime, endTime } }),
  autoAssign: (id) => request.post(`/schedules/${id}/auto-assign`),
  publish: (id) => request.post(`/schedules/${id}/publish`),
  archive: (id) => request.post(`/schedules/${id}/archive`),
  delete: (id) => request.delete(`/schedules/${id}`)
}

export const scheduleSlotApi = {
  getBySchedule: (scheduleId) => request.get(`/schedule-slots/schedule/${scheduleId}`),
  getByScheduleAndRange: (scheduleId, startDate, endDate) =>
    request.get(`/schedule-slots/schedule/${scheduleId}/range`, { params: { startDate, endDate } }),
  getMySlots: (startDate, endDate) =>
    request.get('/schedule-slots/my', { params: { startDate, endDate } }),
  getByUser: (userId) => request.get(`/schedule-slots/user/${userId}`),
  assign: (slotId, userId) => request.put(`/schedule-slots/${slotId}/assign/${userId}`)
}

export const shiftSwapApi = {
  getMySwaps: () => request.get('/shift-swaps/my'),
  getById: (id) => request.get(`/shift-swaps/${id}`),
  getByStatus: (status) => request.get(`/shift-swaps/status/${status}`),
  create: (data) => request.post('/shift-swaps', data),
  approve: (id, comment) => request.post(`/shift-swaps/${id}/approve`, null, { params: { comment } }),
  reject: (id, comment) => request.post(`/shift-swaps/${id}/reject`, null, { params: { comment } }),
  cancel: (id) => request.post(`/shift-swaps/${id}/cancel`)
}

export const voteApi = {
  getBySchedule: (scheduleId) => request.get(`/votes/schedule/${scheduleId}`),
  vote: (scheduleId, voteType, comment) =>
    request.post(`/votes/schedule/${scheduleId}`, null, { params: { voteType, comment } }),
  getCount: (scheduleId) => request.get(`/votes/schedule/${scheduleId}/count`)
}
