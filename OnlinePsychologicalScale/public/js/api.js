const API = {
    async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const token = Common.getToken();
        if (token) {
            defaultOptions.headers['Authorization'] = `Bearer ${token}`;
        }

        const config = { ...defaultOptions, ...options };
        if (config.body && typeof config.body !== 'string') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(`${Common.API_BASE}${url}`, config);
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    Common.logout();
                    Common.showToast('登录已过期，请重新登录', 'error');
                    setTimeout(() => location.href = 'login.html', 1500);
                }
                throw new Error(data.message || '请求失败');
            }

            return data;
        } catch (error) {
            if (error.name !== 'AbortError') {
                Common.showToast(error.message, 'error');
            }
            throw error;
        }
    },

    get(url, params) {
        let fullUrl = url;
        if (params) {
            const searchParams = new URLSearchParams(params);
            fullUrl = `${url}?${searchParams.toString()}`;
        }
        return this.request(fullUrl, { method: 'GET' });
    },

    post(url, data) {
        return this.request(url, { method: 'POST', body: data });
    },

    put(url, data) {
        return this.request(url, { method: 'PUT', body: data });
    },

    delete(url) {
        return this.request(url, { method: 'DELETE' });
    },

    auth: {
        login(data) {
            return API.post('/users/login', data);
        },

        register(data) {
            return API.post('/users/register', data);
        },

        getProfile() {
            return API.get('/users/profile');
        },

        updateProfile(data) {
            return API.put('/users/profile', data);
        }
    },

    scales: {
        list(params) {
            return API.get('/scales', params);
        },

        getDetail(id) {
            return API.get(`/scales/${id}`);
        },

        getInterpretations(id) {
            return API.get(`/scales/${id}/interpretations`);
        }
    },

    answers: {
        startSession(scaleId) {
            return API.post('/answers/start', { scale_id: scaleId });
        },

        autoSave(sessionUuid, answers) {
            return API.put(`/answers/${sessionUuid}/auto-save`, { answers });
        },

        getAutoSave(sessionUuid) {
            return API.get(`/answers/${sessionUuid}/auto-save`);
        },

        submit(sessionUuid, answers) {
            return API.post(`/answers/${sessionUuid}/submit`, { answers });
        },

        getResult(sessionUuid) {
            return API.get(`/answers/${sessionUuid}/result`);
        },

        getMyHistory(params) {
            return API.get('/answers/my', params);
        }
    },

    trends: {
        getMyTrends(params) {
            return API.get('/trends/my', params);
        }
    },

    resources: {
        list(params) {
            return API.get('/resources', params);
        },

        getDetail(id) {
            return API.get(`/resources/${id}`);
        }
    }
};
