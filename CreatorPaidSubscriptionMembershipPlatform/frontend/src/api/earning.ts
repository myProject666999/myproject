import request from '@/utils/request';
import type { CreatorEarnings, EarningDetail, WithdrawalRecord, Page } from '@/types';

export interface WithdrawRequest {
  creatorId: number;
  amount: number;
  withdrawalMethod: string;
  accountInfo: Record<string, string>;
}

export const getCreatorEarnings = (creatorId: number): Promise<CreatorEarnings> => {
  return request.get(`/earnings/creator/${creatorId}`);
};

export const getEarningDetails = (
  creatorId: number,
  page = 0,
  size = 20
): Promise<Page<EarningDetail>> => {
  return request.get(`/earnings/creator/${creatorId}/details`, {
    params: { page, size },
  });
};

export const createWithdrawal = (
  data: WithdrawRequest
): Promise<WithdrawalRecord> => {
  return request.post('/earnings/withdraw', data);
};

export const getCreatorWithdrawals = (
  creatorId: number,
  page = 0,
  size = 20
): Promise<Page<WithdrawalRecord>> => {
  return request.get(`/earnings/withdraw/creator/${creatorId}`, {
    params: { page, size },
  });
};
