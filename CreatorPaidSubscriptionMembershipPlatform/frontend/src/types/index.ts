export interface User {
  id: number;
  username: string;
  email: string;
  nickname: string;
  avatarUrl: string;
  bio: string;
}

export interface Creator {
  id: number;
  userId: number;
  creatorName: string;
  coverImage: string;
  description: string;
  totalSubscribers: number;
  totalEarnings: number;
  isVerified: boolean;
}

export interface MembershipTier {
  id: number;
  creatorId: number;
  tierName: string;
  tierLevel: number;
  price: number;
  description: string;
  benefits: string[];
  isActive: boolean;
}

export type ContentType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';

export interface Content {
  id: number;
  creatorId: number;
  title: string;
  contentType: ContentType;
  content: string;
  mediaUrls: string[];
  thumbnailUrl: string;
  minTierLevel: number;
  isPublished: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';

export interface Subscription {
  id: number;
  userId: number;
  creatorId: number;
  tierId: number;
  status: SubscriptionStatus;
  autoRenew: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: number;
  canceledAt?: string;
  lastPaymentAmount: number;
  lastPaymentAt: string;
}

export interface CreatorEarnings {
  totalEarnings: number;
  pendingEarnings: number;
  availableEarnings: number;
  totalWithdrawn: number;
  totalSubscribers: number;
  activeSubscribers: number;
}

export type SettlementStatus = 'PENDING' | 'SETTLED' | 'WITHDRAWN';

export interface EarningDetail {
  id: number;
  creatorId: number;
  userId: number;
  type: string;
  amount: number;
  platformFee: number;
  settlementStatus: SettlementStatus;
  createdAt: string;
}

export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';

export interface WithdrawalRecord {
  id: number;
  withdrawalNo: string;
  creatorId: number;
  amount: number;
  fee: number;
  actualAmount: number;
  withdrawalMethod: string;
  status: WithdrawalStatus;
  createdAt: string;
}

export interface Result<T> {
  code: number;
  message: string;
  data: T;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
