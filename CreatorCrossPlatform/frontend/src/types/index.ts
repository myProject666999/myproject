export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export interface PlatformMetrics {
  platformId: number;
  platformCode: string;
  platformName: string;
  platformAccountName: string;
  platformAccountAvatar: string;

  totalFans: number;
  newFans: number;
  lostFans: number;
  netFans: number;

  totalViews: number;
  dailyViews: number;

  totalLikes: number;
  dailyLikes: number;

  totalComments: number;
  dailyComments: number;

  totalShares: number;
  dailyShares: number;

  totalCollects: number;
  dailyCollects: number;

  engagementRate: number;

  contentCount: number;
}

export interface TrendData {
  date: string;
  value: number;
  platformCode: string;
}

export interface DashboardOverview {
  creatorId: number;
  statDate: string;

  totalFans: number;
  totalFansChange: number;
  totalFansGrowthRate: number;

  totalViews: number;
  totalViewsChange: number;
  totalViewsGrowthRate: number;

  totalLikes: number;
  totalLikesChange: number;

  totalComments: number;
  totalCommentsChange: number;

  totalShares: number;
  totalSharesChange: number;

  totalCollects: number;
  totalCollectsChange: number;

  avgEngagementRate: number;
  avgEngagementRateChange: number;

  platformCount: number;
  contentCount: number;

  platformMetrics: PlatformMetrics[];
  fansTrend: TrendData[];
  viewsTrend: TrendData[];
}

export interface ContentRank {
  contentId: number;
  platformId: number;
  platformCode: string;
  platformName: string;

  platformContentId: string;
  contentTitle: string;
  contentType: string;
  contentCover: string;
  contentUrl: string;
  publishTime: string;
  publishHour: number;
  publishWeekday: number;
  duration: number;
  tags: string;

  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalCollects: number;

  completeRate: number;
  averageWatchTime: number;
  engagementRate: number;
  hotValue: number;

  rank: number;
}

export interface ContentRankResult {
  records: ContentRank[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface HourAnalysis {
  publishHour: number;
  contentCount: number;
  avgViews: number;
  avgLikes: number;
  avgEngagementRate: number;
  score: number;
}

export interface PublishTimeAnalysis {
  creatorId: number;
  platformId: number;
  platformCode: string;
  platformName: string;

  hourAnalysis: HourAnalysis[];

  bestPublishHour: number;
  bestHourScore: number;
  bestHourContentCount: number;
  bestHourAvgViews: number;
  bestHourAvgEngagementRate: number;

  recommendedHours: number[];
}

export interface PlatformWeeklyMetrics {
  platformId: number;
  platformCode: string;
  platformName: string;

  totalFans: number;
  weeklyNewFans: number;
  weeklyNetFans: number;
  weeklyViews: number;
  weeklyLikes: number;
  weeklyComments: number;
  weeklyShares: number;
  weeklyCollects: number;
  weeklyEngagementRate: number;
  fansGrowthRate: number;
  viewsGrowthRate: number;
}

export interface WeeklyTrend {
  date: string;
  newFans: number;
  views: number;
  interactions: number;
}

export interface WeeklyReport {
  reportId: number;
  creatorId: number;
  reportType: string;
  reportTypeName: string;

  weekStartDate: string;
  weekEndDate: string;
  weekNum: number;

  totalFans: number;
  weeklyNewFans: number;
  weeklyLostFans: number;
  weeklyNetFans: number;

  weeklyViews: number;
  weeklyLikes: number;
  weeklyComments: number;
  weeklyShares: number;
  weeklyCollects: number;

  weeklyEngagementRate: number;

  topContentId: number;
  topContentTitle: string;
  topContentViews: number;
  topContentEngagementRate: number;

  fansGrowthRate: number;
  viewsGrowthRate: number;

  summary: string;
  suggestions: string;

  platformMetrics: PlatformWeeklyMetrics[];
  dailyTrend: WeeklyTrend[];
  topContents: ContentRank[];
}

export interface Platform {
  id: number;
  platformCode: string;
  platformName: string;
  status: number;
  createTime: string;
  updateTime: string;
}

export interface CreatorAccount {
  id: number;
  creatorId: number;
  platformId: number;
  platformAccountId: string;
  platformAccountName: string;
  platformAccountAvatar: string;
  accessToken: string;
  refreshToken: string;
  tokenExpireTime: string;
  bindTime: string;
  lastSyncTime: string;
  syncStatus: number;
  status: number;
  createTime: string;
  updateTime: string;
}
