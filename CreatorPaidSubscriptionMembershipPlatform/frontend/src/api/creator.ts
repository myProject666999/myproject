import request from '@/utils/request';
import type { Creator, MembershipTier, Content, Page } from '@/types';

export const getCreatorById = (id: number): Promise<Creator> => {
  return request.get(`/creators/${id}`);
};

export const getTopCreators = (): Promise<Creator[]> => {
  return request.get('/creators/top');
};

export const searchCreators = (keyword: string): Promise<Creator[]> => {
  return request.get('/creators/search', { params: { keyword } });
};

export const getCreatorTiers = (creatorId: number): Promise<MembershipTier[]> => {
  return request.get(`/creators/${creatorId}/tiers`);
};

export const getCreatorContents = (
  creatorId: number,
  page = 0,
  size = 20
): Promise<Page<Content>> => {
  return request.get(`/contents/creator/${creatorId}`, {
    params: { page, size },
  });
};

export const getAccessibleContents = (
  creatorId: number,
  userId: number,
  page = 0,
  size = 20
): Promise<Page<Content>> => {
  return request.get(`/contents/creator/${creatorId}/accessible`, {
    params: { userId, page, size },
  });
};

export const getAccessibleContentsList = (
  creatorId: number,
  userId: number
): Promise<Content[]> => {
  return request.get(`/contents/creator/${creatorId}/accessible/list`, {
    params: { userId },
  });
};
