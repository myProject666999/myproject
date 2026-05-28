import { request } from './request';
import type {
  ExerciseRecord,
  ExerciseType,
  GetExercisesParams,
  AddExerciseRequest,
  UpdateExerciseRequest,
} from '../types';

export const getExerciseTypes = () => {
  return request<ExerciseType[]>({
    url: '/exercises/types',
    method: 'GET',
  });
};

export const getExercises = (params: GetExercisesParams) => {
  return request<ExerciseRecord[]>({
    url: '/exercises',
    method: 'GET',
    params,
  });
};

export const addExercise = (data: AddExerciseRequest) => {
  return request<ExerciseRecord>({
    url: '/exercises',
    method: 'POST',
    data,
  });
};

export const updateExercise = (id: number, data: UpdateExerciseRequest) => {
  return request<ExerciseRecord>({
    url: `/exercises/${id}`,
    method: 'PUT',
    data,
  });
};

export const deleteExercise = (id: number) => {
  return request<null>({
    url: `/exercises/${id}`,
    method: 'DELETE',
  });
};
