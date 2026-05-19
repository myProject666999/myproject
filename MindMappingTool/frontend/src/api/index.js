import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const userApi = {
  login(data) {
    return request.post('/user/login', data)
  },
  register(data) {
    return request.post('/user/register', data)
  }
}

export const mindmapApi = {
  list(userId) {
    return request.get('/mindmap/list', { params: { userId } })
  },
  get(id) {
    return request.get(`/mindmap/${id}`)
  },
  save(data) {
    return request.post('/mindmap', data)
  },
  update(data) {
    return request.put('/mindmap', data)
  },
  delete(id) {
    return request.delete(`/mindmap/${id}`)
  }
}

export const shareApi = {
  create(mindmapId) {
    return request.post('/share/create', null, { params: { mindmapId } })
  },
  get(code) {
    return request.get(`/share/${code}`)
  }
}
