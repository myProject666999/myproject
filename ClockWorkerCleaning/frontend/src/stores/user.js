import { defineStore } from 'pinia';
import { auth } from '@/api';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    role: (state) => state.userInfo?.role || '',
    isWorker: (state) => state.userInfo?.role === 'worker',
    isAdmin: (state) => state.userInfo?.role === 'admin',
  },

  actions: {
    async login(phone, password) {
      const res = await auth.login({ phone, password });
      this.token = res.data.token;
      this.userInfo = res.data.user;
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userInfo', JSON.stringify(res.data.user));
      return res.data;
    },

    async register(data) {
      const res = await auth.register(data);
      this.token = res.data.token;
      this.userInfo = res.data.user;
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userInfo', JSON.stringify(res.data.user));
      return res.data;
    },

    async refreshProfile() {
      if (!this.token) return;
      const res = await auth.getProfile();
      this.userInfo = res.data;
      localStorage.setItem('userInfo', JSON.stringify(res.data));
    },

    logout() {
      this.token = '';
      this.userInfo = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    },
  },
});
