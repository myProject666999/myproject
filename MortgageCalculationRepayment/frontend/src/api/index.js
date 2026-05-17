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

export const calculateLoan = (data) => request.post('/calculator/calculate', data)
export const simulatePrepayment = (data) => request.post('/calculator/prepayment', data)
export const listSchemes = () => request.get('/loan-schemes')
export const getSchemeDetail = (id) => request.get(`/loan-schemes/${id}/detail`)
export const saveScheme = (data) => request.post('/loan-schemes', data)
export const deleteScheme = (id) => request.delete(`/loan-schemes/${id}`)
export const getStatistics = (id) => request.get('/loan-schemes/statistics', { params: { id } })
export const getRepaymentPlans = (schemeId) => request.get(`/repayment-plans/scheme/${schemeId}`)

export default request
