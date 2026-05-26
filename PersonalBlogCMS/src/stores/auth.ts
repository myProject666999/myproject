import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../api/auth';
import type { User } from '../../shared/types';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<User | null>(null);

  const isLoggedIn = computed(() => !!token.value);

  function init() {
    const stored = localStorage.getItem('user');
    if (stored) {
      user.value = JSON.parse(stored);
    }
  }

  async function login(username: string, password: string) {
    const result = await authApi.login({ username, password });
    token.value = result.token;
    user.value = result.user;
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    return result;
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return {
    token,
    user,
    isLoggedIn,
    init,
    login,
    logout,
  };
});
