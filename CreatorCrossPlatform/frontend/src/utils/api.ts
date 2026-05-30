import axios from "axios";
import type {
  ApiResult,
  DashboardOverview,
  ContentRankResult,
  TrendData,
  PublishTimeAnalysis,
  WeeklyReport,
  Platform,
  CreatorAccount,
} from "@/types";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.response.use(
  (response) => {
    const result = response.data as ApiResult<unknown>;
    if (result.code === 200) {
      return result.data as ReturnType<typeof response.data>;
    }
    return Promise.reject(new Error(result.message || "请求失败"));
  },
  (error) => {
    return Promise.reject(error);
  },
);

export function getDashboardOverview(creatorId: number) {
  return api.get<unknown, DashboardOverview>("/dashboard/overview", {
    params: { creatorId },
  });
}

export function getContentRank(params: {
  creatorId: number;
  platformId?: number;
  sortBy?: string;
  pageNum?: number;
  pageSize?: number;
}) {
  return api.get<unknown, ContentRankResult>("/content/rank", { params });
}

export function getFansTrend(params: {
  creatorId: number;
  platformId?: number;
  startDate: string;
  endDate: string;
}) {
  return api.get<unknown, Record<string, TrendData[]>>("/trend/fans", { params });
}

export function getViewsTrend(params: {
  creatorId: number;
  platformId?: number;
  startDate: string;
  endDate: string;
}) {
  return api.get<unknown, Record<string, TrendData[]>>("/trend/views", { params });
}

export function getEngagementTrend(params: {
  creatorId: number;
  platformId?: number;
  startDate: string;
  endDate: string;
}) {
  return api.get<unknown, Record<string, TrendData[]>>("/trend/engagement", { params });
}

export function getPublishTimeAnalysis(creatorId: number, platformId?: number) {
  return api.get<unknown, PublishTimeAnalysis>("/publish-time/analysis", {
    params: { creatorId, platformId },
  });
}

export function getWeeklyReportDetail(params: {
  creatorId: number;
  reportType?: string;
  weekDate: string;
}) {
  return api.get<unknown, WeeklyReport>("/weekly-report/detail", { params });
}

export function generateWeeklyReport(params: {
  creatorId: number;
  reportType?: string;
  weekStart: string;
  weekEnd: string;
}) {
  return api.post<unknown, WeeklyReport>("/weekly-report/generate", null, { params });
}

export function getWeeklyReportList(params: {
  creatorId: number;
  pageNum?: number;
  pageSize?: number;
}) {
  return api.get<unknown, WeeklyReport[]>("/weekly-report/list", { params });
}

export function getAccountList(creatorId: number) {
  return api.get<unknown, CreatorAccount[]>("/account/list", {
    params: { creatorId },
  });
}

export function getPlatforms() {
  return api.get<unknown, Platform[]>("/account/platforms");
}

export function syncAll(creatorId: number) {
  return api.post<unknown, void>("/sync/all", null, {
    params: { creatorId },
  });
}
