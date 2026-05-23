import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 600000
})

request.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[api error]', err)
    return Promise.reject(err)
  }
)

export const filesApi = {
  list: (path) => request.get('/files/list', { params: { path } }),
  mkdir: (path, name) => request.post('/files/mkdir', { path, name }),
  remove: (path) => request.post('/files/delete', { path }),
  rename: (path, name) => request.post('/files/rename', { path, name }),
  upload: (path, file, onProgress) => {
    const fd = new FormData()
    fd.append('path', path)
    fd.append('file', file)
    return request.post('/files/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(e.loaded / e.total)
      }
    })
  },
  downloadUrl: (path) => `/api/files/download?path=${encodeURIComponent(path)}`
}

export const sharesApi = {
  list: () => request.get('/shares/list'),
  create: (payload) => request.post('/shares/create', payload),
  remove: (id) => request.post('/shares/delete', { id })
}

export const statusApi = {
  index: () => request.get('/status/'),
  disk: () => request.get('/status/disk'),
  samba: () => request.get('/status/samba'),
  system: () => request.get('/status/system')
}

export default request
