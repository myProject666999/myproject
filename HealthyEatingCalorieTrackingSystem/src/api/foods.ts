import { request } from './request';
import type { Food, GetFoodsParams } from '../types';

export const getFoods = (params?: GetFoodsParams) => {
  return request<Food[]>({
    url: '/foods',
    method: 'GET',
    params,
  });
};

export const getFoodById = (id: number) => {
  return request<Food>({
    url: `/foods/${id}`,
    method: 'GET',
  });
};
