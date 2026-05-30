import request from '@/utils/request';
import type { Subscription } from '@/types';

export interface SubscribeRequest {
  userId: number;
  creatorId: number;
  tierId: number;
  paymentMethod: string;
}

export const createSubscription = (
  data: SubscribeRequest
): Promise<Subscription> => {
  return request.post('/subscriptions', data);
};

export const processPaymentSuccess = (orderNo: string): Promise<void> => {
  return request.post('/subscriptions/payment/success', { orderNo });
};

export const cancelSubscription = (
  subscriptionId: number,
  immediate = false
): Promise<void> => {
  return request.post(`/subscriptions/${subscriptionId}/cancel`, null, {
    params: { immediate },
  });
};

export const renewSubscription = (subscriptionId: number): Promise<void> => {
  return request.post(`/subscriptions/${subscriptionId}/renew`);
};

export const getUserSubscriptions = (userId: number): Promise<Subscription[]> => {
  return request.get(`/subscriptions/user/${userId}`);
};

export const getUserActiveSubscription = (
  userId: number,
  creatorId: number
): Promise<Subscription> => {
  return request.get(`/subscriptions/user/${userId}/creator/${creatorId}`);
};

export const getUserMaxTierLevel = (
  userId: number,
  creatorId: number
): Promise<number> => {
  return request.get(`/subscriptions/user/${userId}/creator/${creatorId}/tier-level`);
};
