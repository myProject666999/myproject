const API_BASE = 'http://localhost:8080/api';

const api = {
    async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const mergedOptions = { ...defaultOptions, ...options };

        if (options.body && typeof options.body !== 'string') {
            mergedOptions.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(`${API_BASE}${url}`, mergedOptions);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async getSetting() {
        return this.request('/setting');
    },

    async updateSetting(data) {
        return this.request('/setting', {
            method: 'PUT',
            body: data,
        });
    },

    async updateWeight(weight) {
        return this.request('/setting/weight', {
            method: 'POST',
            body: { weight },
        });
    },

    async calculateTarget(weight) {
        return this.request(`/setting/calculate?weight=${weight}`);
    },

    async drinkWater(amount) {
        return this.request('/water/drink', {
            method: 'POST',
            body: { amount },
        });
    },

    async getTodayRecords() {
        return this.request('/water/today');
    },

    async getTodayTotal() {
        return this.request('/water/today/total');
    },

    async getWeeklyData() {
        return this.request('/water/weekly');
    },

    async deleteRecord(id) {
        return this.request(`/water/${id}`, {
            method: 'DELETE',
        });
    },

    async getTodaySummary() {
        return this.request('/statistics/today');
    },

    async getWeeklySummaries() {
        return this.request('/statistics/weekly');
    },

    async getStatistics() {
        return this.request('/statistics/overview');
    },

    async getContinuousDays() {
        return this.request('/statistics/continuous');
    },
};
