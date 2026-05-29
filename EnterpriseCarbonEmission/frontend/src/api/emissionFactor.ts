import { get, post, put, del } from './request';
import type { EmissionFactor } from '@/types';

export function getCurrentVersionFactors() {
  return get<EmissionFactor[]>('/emission-factor/current');
}

export function getFactorsByType(factorType: number) {
  return get<EmissionFactor[]>(`/emission-factor/type/${factorType}`);
}

export function getEmissionFactorById(id: number) {
  return get<EmissionFactor>(`/emission-factor/${id}`);
}

export function getFactorByCodeAndVersion(factorCode: string, version: string) {
  return get<EmissionFactor>(`/emission-factor/code/${factorCode}/version/${version}`);
}

export function saveEmissionFactor(data: EmissionFactor) {
  return post<boolean>('/emission-factor', data);
}

export function addNewVersion(data: EmissionFactor) {
  return post<boolean>('/emission-factor/version', data);
}

export function updateEmissionFactor(data: EmissionFactor) {
  return put<boolean>('/emission-factor', data);
}

export function deleteEmissionFactor(id: number) {
  return del<boolean>(`/emission-factor/${id}`);
}
