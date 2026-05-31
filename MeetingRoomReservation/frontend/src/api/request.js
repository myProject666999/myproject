import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
    baseURL: '/api',
    timeout: 10000
})

request.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

request.interceptors.response.use(
    response => {
        const res = response.data
        if (res.code !== 200) {
            ElMessage.error(res.message || '请求失败')
            if (res.code === 401) {
                localStorage.removeItem('token')
                router.push('/login')
            }
            return Promise.reject(new Error(res.message || '请求失败'))
        }
        return res
    },
    error => {
        if (error.response) {
            const status = error.response.status
            if (status === 401) {
                ElMessage.error('登录已过期，请重新登录')
                localStorage.removeItem('token')
                router.push('/login')
            } else if (status === 403) {
                ElMessage.error('没有权限访问')
            } else if (status === 404) {
                ElMessage.error('请求的资源不存在')
            } else if (status >= 500) {
                ElMessage.error('服务器错误，请稍后重试')
            }
        } else {
            ElMessage.error('网络连接失败，请检查网络')
        }
        return Promise.reject(error)
    }
)

export default request
