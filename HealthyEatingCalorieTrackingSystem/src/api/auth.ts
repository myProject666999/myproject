import { request } from './request';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  UserGoal,
  UpdateProfileRequest,
} from '../types';

export const login = (data: LoginRequest) => {
  return request<LoginResponse>({
    url: '/auth/login',
    method: 'POST',
    data,
  });
};

export const register = (data: RegisterRequest) => {
  return request<LoginResponse>({
    url: '/auth/register',
    method: 'POST',
    data,
  });
};

export const getProfile = () => {
  return request<User>({
    url: '/auth/profile',
    method: 'GET',
  });
};

export const updateProfile = (data: UpdateProfileRequest) => {
  return request<User>({
    url: '/auth/profile',
    method: 'PUT',
    data,
  });
};
