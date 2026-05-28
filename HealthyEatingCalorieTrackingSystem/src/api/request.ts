import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../types';
import { mockApiHandler } from '../utils/mockServer';

const USE_MOCK = true;

const instance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('goal');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const request = <T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  if (USE_MOCK) {
    const url = config.url?.startsWith('/') ? config.url : `/${config.url}`;
    const fullUrl = config.params 
      ? `${url}?${new URLSearchParams(config.params).toString()}`
      : url;
    return mockApiHandler(fullUrl, {
      method: config.method,
      body: config.data ? JSON.stringify(config.data) : undefined,
    }) as Promise<ApiResponse<T>>;
  }
  return instance(config) as Promise<ApiResponse<T>>;
};

export default instance;
