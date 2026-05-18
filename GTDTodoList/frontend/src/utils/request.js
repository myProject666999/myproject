import axios from 'axios'
import store from '@/store'

const request = axios.create({
    baseURL: store.state.apiBaseUrl,
    timeout: 10000
})

request.interceptors.response.use(
    response => response.data,
    error => {
        console.error('Request error:', error)
        return Promise.reject(error)
    }
)

export default request
