import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 30000
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export const authApi = {
    login: (data) => api.post('/auth/login', data).then(r => r.data),
    register: (data) => api.post('/auth/register', data).then(r => r.data),
    getProfile: () => api.get('/auth/profile').then(r => r.data),
    getUsers: () => api.get('/auth/users').then(r => r.data)
};

export const contractApi = {
    list: (params) => api.get('/contracts', { params }).then(r => r.data),
    myContracts: () => api.get('/contracts/my').then(r => r.data),
    pending: () => api.get('/contracts/pending').then(r => r.data),
    signed: () => api.get('/contracts/signed').then(r => r.data),
    archived: () => api.get('/contracts/archived').then(r => r.data),
    detail: (id) => api.get(`/contracts/${id}`).then(r => r.data),
    upload: (formData) => api.post('/contracts/upload', formData).then(r => r.data),
    create: (data) => api.post('/contracts', data).then(r => r.data),
    submit: (id) => api.post(`/contracts/${id}/submit`).then(r => r.data),
    sign: (id, data) => api.post(`/contracts/${id}/sign`, data).then(r => r.data),
    reject: (id, data) => api.post(`/contracts/${id}/reject`, data).then(r => r.data),
    archive: (id) => api.post(`/contracts/${id}/archive`).then(r => r.data),
    verify: (id) => api.get(`/contracts/${id}/verify`).then(r => r.data)
};

export default api;
