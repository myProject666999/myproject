import { request } from './request';
import type { UserGoal, UpdateGoalRequest } from '../types';

export const getGoal = () => {
  return request<UserGoal>({
    url: '/goals',
    method: 'GET',
  });
};

export const updateGoal = (data: UpdateGoalRequest) => {
  return request<UserGoal>({
    url: '/goals',
    method: 'PUT',
    data,
  });
};
