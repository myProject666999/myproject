import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const getStats = () => api.get('/stats')

export const search = (query) => api.get('/search', { params: { q: query } })

export const getLatestBlock = () => api.get('/blocks/latest')

export const getRecentBlocks = (count = 10) => api.get('/blocks/recent', { params: { count } })

export const getBlockByNumber = (number) => api.get(`/blocks/number/${number}`)

export const getBlockByHash = (hash) => api.get(`/blocks/hash/${hash}`)

export const getTransaction = (hash) => api.get(`/transactions/${hash}`)

export const getAddress = (address) => api.get(`/addresses/${address}`)

export const getAddressTransactions = (address) => api.get(`/addresses/${address}/transactions`)

export const getGasTracker = () => api.get('/gas/tracker')

export const getGasHistory = (hours = 24) => api.get('/gas/history', { params: { hours } })

export default api