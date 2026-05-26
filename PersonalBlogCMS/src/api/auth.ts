import api from './index';
import type { LoginRequest, LoginResponse } from '../../shared/types';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<never, LoginResponse>('/auth/login', data),

  changePassword: (oldPassword: string, newPassword: string) =>
    api.put<never, void>('/auth/password', { oldPassword, newPassword }),
};
