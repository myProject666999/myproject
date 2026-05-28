import { request } from './request';
import type { WeightRecord, AddWeightRequest } from '../types';

export const getWeights = () => {
  return request<WeightRecord[]>({
    url: '/weights',
    method: 'GET',
  });
};

export const addWeight = (data: AddWeightRequest) => {
  return request<WeightRecord>({
    url: '/weights',
    method: 'POST',
    data,
  });
};
