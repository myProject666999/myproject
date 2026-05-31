import axios from 'axios';
import { message } from 'antd';
import { getToken, removeToken } from './auth';

const request = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

request.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === 0) {
      return res.data;
    }
    message.error(res.message || '请求失败');
    return Promise.reject(new Error(res.message || '请求失败'));
  },
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    const msg = error.response?.data?.message || error.message || '网络错误';
    message.error(msg);
    return Promise.reject(error);
  },
);

export function get<T>(url: string, params?: object): Promise<T> {
  return request.get(url, { params }) as Promise<T>;
}

export function post<T>(url: string, data?: object): Promise<T> {
  return request.post(url, data) as Promise<T>;
}

export function put<T>(url: string, data?: object): Promise<T> {
  return request.put(url, data) as Promise<T>;
}

export function del<T>(url: string): Promise<T> {
  return request.delete(url) as Promise<T>;
}

export default request;
