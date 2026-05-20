import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 200) {
      return res.data
    }
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  error => {
    return Promise.reject(error)
  }
)

export const booklistAPI = {
  getBookLists: () => request.get('/booklists'),
  getBookListsByStatus: (status) => request.get(`/booklists/status/${status}`),
  getBookList: (id) => request.get(`/booklists/${id}`),
  createBookList: (data) => request.post('/booklists', data),
  updateBookList: (id, data) => request.put(`/booklists/${id}`, data),
  updateStatus: (id, status) => request.patch(`/booklists/${id}/status?status=${status}`),
  deleteBookList: (id) => request.delete(`/booklists/${id}`),

  getTags: () => request.get('/tags'),
  createTag: (data) => request.post('/tags', data),

  searchIsbn: (isbn) => request.get(`/isbn-search/${isbn}`),

  getReadingRecords: (bookListId) => request.get(`/reading-records/booklist/${bookListId}`),
  createReadingRecord: (data) => request.post('/reading-records', data),
  deleteReadingRecord: (id) => request.delete(`/reading-records/${id}`),

  getYearlyReport: (year) => request.get(`/yearly-report${year ? `/${year}` : ''}`)
}

export default request
