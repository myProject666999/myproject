import axios from 'axios';
import { showToast, showDialog } from 'vant';
import router from '@/router';

const request = axios.create({
  baseURL: '',
  timeout: 15000,
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === 0) {
      return res;
    }

    if (res.code === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      showToast('登录已过期，请重新登录');
      setTimeout(() => {
        router.push('/login');
      }, 1000);
      return Promise.reject(res);
    }

    showToast(res.message || '请求失败');
    return Promise.reject(res);
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      showToast('登录已过期，请重新登录');
      router.push('/login');
    } else {
      showToast(error.message || '网络错误');
    }
    return Promise.reject(error);
  }
);

export default request;
