import { get, post, put, del } from './request';
import type { Organization } from '@/types';

export function getOrganizationTree() {
  return get<Organization[]>('/organization/tree');
}

export function getOrganizationList() {
  return get<Organization[]>('/organization/list');
}

export function getOrganizationById(id: number) {
  return get<Organization>(`/organization/${id}`);
}

export function saveOrganization(data: Organization) {
  return post<boolean>('/organization', data);
}

export function updateOrganization(data: Organization) {
  return put<boolean>('/organization', data);
}

export function deleteOrganization(id: number) {
  return del<boolean>(`/organization/${id}`);
}

export function getChildOrganizations(parentId: number) {
  return get<Organization[]>(`/organization/children/${parentId}`);
}
