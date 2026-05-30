import request from '@/utils/request';
import type { User, Creator } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export const login = (data: LoginRequest): Promise<User> => {
  return request.post('/users/login', data);
};

export const getUserById = (id: number): Promise<User> => {
  return request.get(`/users/${id}`);
};

export const getCreatorByUserId = (userId: number): Promise<Creator> => {
  return request.get(`/creators/user/${userId}`);
};
