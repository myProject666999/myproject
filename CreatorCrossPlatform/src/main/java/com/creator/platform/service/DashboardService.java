package com.creator.platform.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.creator.platform.cache.RedisCacheService;
import com.creator.platform.entity.*;
import com.creator.platform.mapper.*;
import com.creator.platform.vo.DashboardOverviewVO;
import com.creator.platform.vo.PlatformMetricsVO;
import com.creator.platform.vo.TrendDataVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final RedisCacheService redisCacheService;
    private final AccountDailyMetricsMapper accountDailyMetricsMapper;
    private final CreatorAccountMapper creatorAccountMapper;
    private final PlatformMapper platformMapper;
    private final ContentMapper contentMapper;

    private static final String DASHBOARD_CACHE_KEY = "dashboard:overview:";
    private static final int CACHE_MINUTES = 10;

    public DashboardOverviewVO getDashboardOverview(Long creatorId) {
        String cacheKey = DASHBOARD_CACHE_KEY + creatorId + ":" + LocalDate.now();
        DashboardOverviewVO cached = redisCacheService.get(cacheKey, DashboardOverviewVO.class);
        if (cached != null) {
            log.debug("从缓存获取总览数据, creatorId: {}", creatorId);
            return cached;
        }

        DashboardOverviewVO vo = calculateDashboardOverview(creatorId);
        redisCacheService.set(cacheKey, vo, CACHE_MINUTES, TimeUnit.MINUTES);
        return vo;
    }

    private DashboardOverviewVO calculateDashboardOverview(Long creatorId) {
        DashboardOverviewVO vo = new DashboardOverviewVO();
        vo.setCreatorId(creatorId);
        vo.setStatDate(LocalDate.now());

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate lastWeekStart = today.minusDays(7);

        List<CreatorAccount> accounts = creatorAccountMapper.selectList(
                new LambdaQueryWrapper<CreatorAccount>()
                        .eq(CreatorAccount::getCreatorId, creatorId)
                        .eq(CreatorAccount::getStatus, 1)
        );

        if (accounts.isEmpty()) {
            return vo;
        }

        List<Long> accountIds = accounts.stream().map(CreatorAccount::getId).toList();
        Map<Long, CreatorAccount> accountMap = accounts.stream()
                .collect(Collectors.toMap(CreatorAccount::getId, a -> a));
        Map<Long, Platform> platformMap = platformMapper.selectList(null).stream()
                .collect(Collectors.toMap(Platform::getId, p -> p));

        List<AccountDailyMetrics> todayMetrics = accountDailyMetricsMapper.selectList(
                new LambdaQueryWrapper<AccountDailyMetrics>()
                        .in(AccountDailyMetrics::getAccountId, accountIds)
                        .eq(AccountDailyMetrics::getStatDate, today)
        );

        List<AccountDailyMetrics> yesterdayMetrics = accountDailyMetricsMapper.selectList(
                new LambdaQueryWrapper<AccountDailyMetrics>()
                        .in(AccountDailyMetrics::getAccountId, accountIds)
                        .eq(AccountDailyMetrics::getStatDate, yesterday)
        );

        List<AccountDailyMetrics> lastWeekMetrics = accountDailyMetricsMapper.selectList(
                new LambdaQueryWrapper<AccountDailyMetrics>()
                        .in(AccountDailyMetrics::getAccountId, accountIds)
                        .between(AccountDailyMetrics::getStatDate, lastWeekStart, yesterday)
        );

        long totalFans = sumField(todayMetrics, AccountDailyMetrics::getTotalFans);
        long yesterdayTotalFans = sumField(yesterdayMetrics, AccountDailyMetrics::getTotalFans);
        long totalFansChange = totalFans - yesterdayTotalFans;

        long totalViews = sumField(todayMetrics, AccountDailyMetrics::getTotalViews);
        long yesterdayTotalViews = sumField(yesterdayMetrics, AccountDailyMetrics::getTotalViews);
        long totalViewsChange = totalViews - yesterdayTotalViews;

        vo.setTotalFans(totalFans);
        vo.setTotalFansChange(totalFansChange);
        vo.setTotalFansGrowthRate(calculateGrowthRate(totalFansChange, yesterdayTotalFans));

        vo.setTotalViews(totalViews);
        vo.setTotalViewsChange(totalViewsChange);
        vo.setTotalViewsGrowthRate(calculateGrowthRate(totalViewsChange, yesterdayTotalViews));

        vo.setTotalLikes(sumField(todayMetrics, AccountDailyMetrics::getTotalLikes));
        vo.setTotalLikesChange(sumField(todayMetrics, AccountDailyMetrics::getDailyLikes) - sumField(yesterdayMetrics, AccountDailyMetrics::getDailyLikes));

        vo.setTotalComments(sumField(todayMetrics, AccountDailyMetrics::getTotalComments));
        vo.setTotalCommentsChange(sumField(todayMetrics, AccountDailyMetrics::getDailyComments) - sumField(yesterdayMetrics, AccountDailyMetrics::getDailyComments));

        vo.setTotalShares(sumField(todayMetrics, AccountDailyMetrics::getTotalShares));
        vo.setTotalSharesChange(sumField(todayMetrics, AccountDailyMetrics::getDailyShares) - sumField(yesterdayMetrics, AccountDailyMetrics::getDailyShares));

        vo.setTotalCollects(sumField(todayMetrics, AccountDailyMetrics::getTotalCollects));
        vo.setTotalCollectsChange(sumField(todayMetrics, AccountDailyMetrics::getDailyCollects) - sumField(yesterdayMetrics, AccountDailyMetrics::getDailyCollects));

        vo.setAvgEngagementRate(calculateAvgEngagementRate(todayMetrics));
        vo.setAvgEngagementRateChange(calculateAvgEngagementRate(todayMetrics).subtract(calculateAvgEngagementRate(yesterdayMetrics)));

        vo.setPlatformCount(accounts.size());
        Long contentCount = contentMapper.selectCount(
                new LambdaQueryWrapper<Content>().in(Content::getAccountId, accountIds)
        );
        vo.setContentCount(contentCount != null ? contentCount.intValue() : 0);

        List<PlatformMetricsVO> platformMetrics = new ArrayList<>();
        for (CreatorAccount account : accounts) {
            Platform platform = platformMap.get(account.getPlatformId());
            PlatformMetricsVO pmVO = new PlatformMetricsVO();
            pmVO.setPlatformId(platform.getId());
            pmVO.setPlatformCode(platform.getPlatformCode());
            pmVO.setPlatformName(platform.getPlatformName());
            pmVO.setPlatformAccountName(account.getPlatformAccountName());
            pmVO.setPlatformAccountAvatar(account.getPlatformAccountAvatar());

            AccountDailyMetrics tm = todayMetrics.stream()
                    .filter(m -> m.getAccountId().equals(account.getId()))
                    .findFirst().orElse(null);
            if (tm != null) {
                pmVO.setTotalFans(tm.getTotalFans());
                pmVO.setNewFans(tm.getNewFans() != null ? tm.getNewFans().longValue() : 0L);
                pmVO.setLostFans(tm.getLostFans() != null ? tm.getLostFans().longValue() : 0L);
                pmVO.setNetFans((long) (tm.getNewFans() != null ? tm.getNewFans() : 0) - (tm.getLostFans() != null ? tm.getLostFans() : 0));
                pmVO.setTotalViews(tm.getTotalViews());
                pmVO.setDailyViews(tm.getDailyViews() != null ? tm.getDailyViews() : 0);
                pmVO.setTotalLikes(tm.getTotalLikes());
                pmVO.setDailyLikes(tm.getDailyLikes() != null ? tm.getDailyLikes() : 0);
                pmVO.setTotalComments(tm.getTotalComments());
                pmVO.setDailyComments(tm.getDailyComments() != null ? tm.getDailyComments() : 0);
                pmVO.setTotalShares(tm.getTotalShares());
                pmVO.setDailyShares(tm.getDailyShares() != null ? tm.getDailyShares() : 0);
                pmVO.setTotalCollects(tm.getTotalCollects());
                pmVO.setDailyCollects(tm.getDailyCollects() != null ? tm.getDailyCollects() : 0);
                pmVO.setEngagementRate(tm.getEngagementRate());
            }

            Long pContentCount = contentMapper.selectCount(
                    new LambdaQueryWrapper<Content>().eq(Content::getAccountId, account.getId())
            );
            pmVO.setContentCount(pContentCount != null ? pContentCount.intValue() : 0);

            platformMetrics.add(pmVO);
        }
        vo.setPlatformMetrics(platformMetrics);

        vo.setFansTrend(generateFansTrend(accountIds, lastWeekStart, today, platformMap));
        vo.setViewsTrend(generateViewsTrend(accountIds, lastWeekStart, today, platformMap));

        return vo;
    }

    private List<TrendDataVO> generateFansTrend(List<Long> accountIds, LocalDate startDate, LocalDate endDate, Map<Long, Platform> platformMap) {
        List<TrendDataVO> trend = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            LocalDate currentDate = date;
            List<AccountDailyMetrics> metrics = accountDailyMetricsMapper.selectList(
                    new LambdaQueryWrapper<AccountDailyMetrics>()
                            .in(AccountDailyMetrics::getAccountId, accountIds)
                            .eq(AccountDailyMetrics::getStatDate, currentDate)
            );
            long totalNewFans = sumField(metrics, m -> (long) (m.getNewFans() != null ? m.getNewFans() : 0));
            trend.add(new TrendDataVO(date, totalNewFans, "ALL"));
        }
        return trend;
    }

    private List<TrendDataVO> generateViewsTrend(List<Long> accountIds, LocalDate startDate, LocalDate endDate, Map<Long, Platform> platformMap) {
        List<TrendDataVO> trend = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            LocalDate currentDate = date;
            List<AccountDailyMetrics> metrics = accountDailyMetricsMapper.selectList(
                    new LambdaQueryWrapper<AccountDailyMetrics>()
                            .in(AccountDailyMetrics::getAccountId, accountIds)
                            .eq(AccountDailyMetrics::getStatDate, currentDate)
            );
            long totalDailyViews = sumField(metrics, m -> (long) (m.getDailyViews() != null ? m.getDailyViews() : 0));
            trend.add(new TrendDataVO(date, totalDailyViews, "ALL"));
        }
        return trend;
    }

    private long sumField(List<AccountDailyMetrics> metrics, java.util.function.ToLongFunction<AccountDailyMetrics> function) {
        return metrics.stream().mapToLong(function).sum();
    }

    private BigDecimal calculateGrowthRate(long change, long base) {
        if (base == 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(change)
                .divide(BigDecimal.valueOf(base), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    private BigDecimal calculateAvgEngagementRate(List<AccountDailyMetrics> metrics) {
        if (metrics.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal sum = metrics.stream()
                .map(m -> m.getEngagementRate() != null ? m.getEngagementRate() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return sum.divide(BigDecimal.valueOf(metrics.size()), 4, RoundingMode.HALF_UP);
    }

    public void evictCache(Long creatorId) {
        String cacheKey = DASHBOARD_CACHE_KEY + creatorId + ":" + LocalDate.now();
        redisCacheService.delete(cacheKey);
    }
}
