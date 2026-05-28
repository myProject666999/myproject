import { request } from './request';
import type {
  MealRecord,
  GetMealsParams,
  AddMealRequest,
  UpdateMealRequest,
} from '../types';

export const getMeals = (params: GetMealsParams) => {
  return request<MealRecord[]>({
    url: '/meals',
    method: 'GET',
    params,
  });
};

export const addMeal = (data: AddMealRequest) => {
  return request<MealRecord>({
    url: '/meals',
    method: 'POST',
    data,
  });
};

export const updateMeal = (id: number, data: UpdateMealRequest) => {
  return request<MealRecord>({
    url: `/meals/${id}`,
    method: 'PUT',
    data,
  });
};

export const deleteMeal = (id: number) => {
  return request<null>({
    url: `/meals/${id}`,
    method: 'DELETE',
  });
};
