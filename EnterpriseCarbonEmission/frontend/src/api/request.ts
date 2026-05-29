import axios from 'axios';
import type { ApiResult } from '@/types';

const request = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

request.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResult<unknown>;
    if (res.code !== 200) {
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return res.data as any;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  return request.get(url, { params }) as Promise<T>;
}

export function post<T>(url: string, data?: unknown, params?: Record<string, unknown>): Promise<T> {
  return request.post(url, data, { params }) as Promise<T>;
}

export function put<T>(url: string, data?: unknown): Promise<T> {
  return request.put(url, data) as Promise<T>;
}

export function del<T>(url: string): Promise<T> {
  return request.delete(url) as Promise<T>;
}

export function upload<T>(url: string, formData: FormData, params?: Record<string, unknown>): Promise<T> {
  return request.post(url, formData, {
    params,
    headers: { 'Content-Type': 'multipart/form-data' },
  }) as Promise<T>;
}

export default request;
