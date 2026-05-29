import { get, post } from './request';
import type { EmissionCalculation } from '@/types';

export function calculateEmission(orgId: number, periodType: number, periodValue: string) {
  return post<Record<string, unknown>>('/emission-calculation/calculate', undefined, { orgId, periodType, periodValue });
}

export function getCalculationResults(orgId: number, periodType: number, periodValue: string) {
  return get<EmissionCalculation[]>('/emission-calculation/results', { orgId, periodType, periodValue });
}

export function getEmissionCalculationById(id: number) {
  return get<EmissionCalculation>(`/emission-calculation/${id}`);
}
