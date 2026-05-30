import { useEffect, useState } from "react";
import {
  Trophy,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  Flame,
} from "lucide-react";
import dayjs from "dayjs";
import { getContentRank } from "@/utils/api";
import type { ContentRank, ContentRankResult } from "@/types";

type SortBy = "hotValue" | "totalViews" | "totalLikes" | "totalComments";
type PlatformFilter = "all" | "DOUYIN" | "BILIBILI" | "XIAOHONGSHU";

const platformBadgeClass: Record<string, string> = {
  DOUYIN: "badge-douyin",
  BILIBILI: "badge-bilibili",
  XIAOHONGSHU: "badge-xiaohongshu",
};

const platformNames: Record<string, string> = {
  DOUYIN: "抖音",
  BILIBILI: "B站",
  XIAOHONGSHU: "小红书",
};

const sortOptions: { value: SortBy; label: string }[] = [
  { value: "hotValue", label: "热度值" },
  { value: "totalViews", label: "播放量" },
  { value: "totalLikes", label: "点赞数" },
  { value: "totalComments", label: "评论数" },
];

const platformFilters: { value: PlatformFilter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "DOUYIN", label: "抖音" },
  { value: "BILIBILI", label: "B站" },
  { value: "XIAOHONGSHU", label: "小红书" },
];

interface ContentCardProps {
  content: ContentRank;
  rank: number;
}

function ContentCard({ content, rank }: ContentCardProps) {
  const badgeClass = platformBadgeClass[content.platformCode] || "badge";
  const isTop3 = rank <= 3;

  return (
    <div className="card card-hover">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {isTop3 ? (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                rank === 1
                  ? "bg-gradient-to-br from-yellow-400 to-amber-500"
                  : rank === 2
                  ? "bg-gradient-to-br from-slate-300 to-slate-400"
                  : "bg-gradient-to-br from-amber-600 to-amber-700"
              }`}
            >
              <Trophy className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
              <span className="text-slate-300 font-semibold">{rank}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-white font-medium truncate">{content.contentTitle}</h3>
            <span className={badgeClass}>
              {platformNames[content.platformCode] || content.platformName}
            </span>
          </div>

          <p className="text-slate-400 text-sm mb-3">
            发布时间: {dayjs(content.publishTime).format("YYYY-MM-DD HH:mm")}
          </p>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 text-sm">
                {content.totalViews.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 text-sm">
                {content.totalLikes.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 text-sm">
                {content.totalComments.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 text-sm">
                {content.totalShares.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 text-sm">
                {content.totalCollects.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-medium">
                {content.hotValue.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">互动率</span>
              <span className="text-indigo-400 font-medium">
                {(content.engagementRate * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContentRankPage() {
  const [sortBy, setSortBy] = useState<SortBy>("hotValue");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(10);
  const [data, setData] = useState<ContentRankResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params: {
          creatorId: number;
          sortBy: string;
          pageNum: number;
          pageSize: number;
          platformId?: number;
        } = {
          creatorId: 1,
          sortBy,
          pageNum,
          pageSize,
        };

        if (platformFilter !== "all") {
          const platformIdMap: Record<string, number> = {
            DOUYIN: 1,
            BILIBILI: 2,
            XIAOHONGSHU: 3,
          };
          params.platformId = platformIdMap[platformFilter];
        }

        const result = await getContentRank(params);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch content rank:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sortBy, platformFilter, pageNum, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (!data || newPage <= data.pages)) {
      setPageNum(newPage);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">内容排行</h1>
          <p className="text-slate-400 text-sm mt-1">查看您的内容表现排名</p>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">平台:</span>
            <div className="flex gap-1">
              {platformFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => {
                    setPlatformFilter(filter.value);
                    setPageNum(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    platformFilter === filter.value
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortBy);
                  setPageNum(1);
                }}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : !data || data.records.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16">
          <Bookmark className="w-12 h-12 text-slate-500 mb-4" />
          <p className="text-slate-400">暂无内容数据</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data.records.map((content: ContentRank, index: number) => (
              <ContentCard
                key={content.contentId}
                content={content}
                rank={(pageNum - 1) * pageSize + index + 1}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => handlePageChange(pageNum - 1)}
              disabled={pageNum <= 1}
              className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-slate-400 text-sm">
              第 {pageNum} 页 / 共 {data.pages} 页 ({data.total} 条)
            </span>

            <button
              onClick={() => handlePageChange(pageNum + 1)}
              disabled={pageNum >= data.pages}
              className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
