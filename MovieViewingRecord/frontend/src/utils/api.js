import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  response => response.data,
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

export default {
  searchMovies(params) {
    return request.get('/movies', { params })
  },

  getMovieById(id) {
    return request.get(`/movies/${id}`)
  },

  saveMovie(movie) {
    return request.post('/movies', movie)
  },

  getRecords(params) {
    return request.get('/records', { params })
  },

  getRecordByMovieId(movieId) {
    return request.get(`/records/movie/${movieId}`)
  },

  saveRecord(record) {
    return request.post('/records', record)
  },

  updateRecord(id, record) {
    return request.put(`/records/${id}`, record)
  },

  deleteRecord(id) {
    return request.delete(`/records/${id}`)
  },

  getYearTop(year) {
    return request.get(`/year-top/${year}`)
  },

  getTopYears() {
    return request.get('/year-top/years')
  },

  saveYearTop(yearTop) {
    return request.post('/year-top', yearTop)
  },

  deleteYearTop(id) {
    return request.delete(`/year-top/${id}`)
  },

  clearYearTop(year) {
    return request.delete(`/year-top/clear/${year}`)
  }
}
