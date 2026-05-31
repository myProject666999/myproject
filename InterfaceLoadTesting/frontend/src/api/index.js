import request from './request'

export const authApi = {
  login(data) {
    return request.post('/auth/login', data)
  },
  getUserInfo() {
    return request.get('/auth/user')
  }
}

export const targetApi = {
  list(params) {
    return request.get('/targets', { params })
  },
  get(id) {
    return request.get(`/targets/${id}`)
  },
  create(data) {
    return request.post('/targets', data)
  },
  update(id, data) {
    return request.put(`/targets/${id}`, data)
  },
  remove(id) {
    return request.delete(`/targets/${id}`)
  }
}

export const taskApi = {
  list(params) {
    return request.get('/tasks', { params })
  },
  get(id) {
    return request.get(`/tasks/${id}`)
  },
  create(data) {
    return request.post('/tasks', data)
  },
  start(id) {
    return request.post(`/tasks/${id}/start`)
  },
  stop(id) {
    return request.post(`/tasks/${id}/stop`)
  },
  remove(id) {
    return request.delete(`/tasks/${id}`)
  }
}

export const metricsApi = {
  getTaskMetrics(taskId, limit = 60) {
    return request.get(`/metrics/task/${taskId}`, { params: { limit } })
  },
  getHistory(taskId, params) {
    return request.get(`/metrics/task/${taskId}/history`, { params })
  }
}

export const reportApi = {
  list(params) {
    return request.get('/reports', { params })
  },
  get(id) {
    return request.get(`/reports/${id}`)
  },
  getByTaskId(taskId) {
    return request.get(`/reports/task/${taskId}`)
  },
  remove(id) {
    return request.delete(`/reports/${id}`)
  }
}

export const baselineApi = {
  list(params) {
    return request.get('/baselines', { params })
  },
  get(id) {
    return request.get(`/baselines/${id}`)
  },
  create(data) {
    return request.post('/baselines', data)
  },
  update(id, data) {
    return request.put(`/baselines/${id}`, data)
  },
  remove(id) {
    return request.delete(`/baselines/${id}`)
  },
  compare(data) {
    return request.post('/comparisons', data)
  }
}

export const comparisonApi = {
  list(params) {
    return request.get('/comparisons', { params })
  }
}

export const alarmApi = {
  list(params) {
    return request.get('/alarms', { params })
  },
  handle(id) {
    return request.post(`/alarms/${id}/handle`)
  }
}
