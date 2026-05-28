package com.creator.platform.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.creator.platform.cache.RedisCacheService;
import com.creator.platform.entity.AccountDailyMetrics;
import com.creator.platform.entity.CreatorAccount;
import com.creator.platform.entity.Platform;
import com.creator.platform.mapper.AccountDailyMetricsMapper;
import com.creator.platform.mapper.CreatorAccountMapper;
import com.creator.platform.mapper.PlatformMapper;
import com.creator.platform.vo.TrendDataVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrendAnalysisService {

    private final RedisCacheService redisCacheService;
    private final AccountDailyMetricsMapper accountDailyMetricsMapper;
    private final CreatorAccountMapper creatorAccountMapper;
    private final PlatformMapper platformMapper;

    private static final String TREND_CACHE_KEY = "trend:analysis:";
    private static final int CACHE_MINUTES = 20;

    public Map<String, List<TrendDataVO>> getFansTrend(Long creatorId, Long platformId, LocalDate startDate, LocalDate endDate) {
        return getTrendData(creatorId, platformId, startDate, endDate, "fans");
    }

    public Map<String, List<TrendDataVO>> getViewsTrend(Long creatorId, Long platformId, LocalDate startDate, LocalDate endDate) {
        return getTrendData(creatorId, platformId, startDate, endDate, "views");
    }

    public Map<String, List<TrendDataVO>> getEngagementTrend(Long creatorId, Long platformId, LocalDate startDate, LocalDate endDate) {
        return getTrendData(creatorId, platformId, startDate, endDate, "engagement");
    }

    private Map<String, List<TrendDataVO>> getTrendData(Long creatorId, Long platformId, LocalDate startDate, LocalDate endDate, String metricType) {
        String cacheKey = TREND_CACHE_KEY + creatorId + ":" + (platformId != null ? platformId : "all") + ":" + metricType + ":" + startDate + ":" + endDate;
        @SuppressWarnings("unchecked")
        Map<String, List<TrendDataVO>> cached = (Map<String, List<TrendDataVO>>) redisCacheService.get(cacheKey);
        if (cached != null) {
            return cached;
        }

        Map<String, List<TrendDataVO>> result = calculateTrendData(creatorId, platformId, startDate, endDate, metricType);
        redisCacheService.set(cacheKey, result, CACHE_MINUTES, TimeUnit.MINUTES);
        return result;
    }

    private Map<String, List<TrendDataVO>> calculateTrendData(Long creatorId, Long platformId, LocalDate startDate, LocalDate endDate, String metricType) {
        Map<String, List<TrendDataVO>> result = new HashMap<>();

        List<CreatorAccount> accounts = creatorAccountMapper.selectList(
                new LambdaQueryWrapper<CreatorAccount>()
                        .eq(CreatorAccount::getCreatorId, creatorId)
                        .eq(CreatorAccount::getStatus, 1)
                        .apply(platformId != null, "platform_id = {0}", platformId)
        );

        if (accounts.isEmpty()) {
            return result;
        }

        List<Long> accountIds = accounts.stream().map(CreatorAccount::getId).toList();
        Map<Long, CreatorAccount> accountMap = accounts.stream()
                .collect(Collectors.toMap(CreatorAccount::getId, a -> a));
        Map<Long, Platform> platformMap = platformMapper.selectList(null).stream()
                .collect(Collectors.toMap(Platform::getId, p -> p));

        List<AccountDailyMetrics> allMetrics = accountDailyMetricsMapper.selectList(
                new LambdaQueryWrapper<AccountDailyMetrics>()
                        .in(AccountDailyMetrics::getAccountId, accountIds)
                        .between(AccountDailyMetrics::getStatDate, startDate, endDate)
        );

        Map<Long, Map<LocalDate, AccountDailyMetrics>> metricsByAccountAndDate = allMetrics.stream()
                .collect(Collectors.groupingBy(
                        AccountDailyMetrics::getAccountId,
                        Collectors.toMap(AccountDailyMetrics::getStatDate, m -> m)
                ));

        for (CreatorAccount account : accounts) {
            Platform platform = platformMap.get(account.getPlatformId());
            String platformCode = platform != null ? platform.getPlatformCode() : "UNKNOWN";
            List<TrendDataVO> platformTrend = new ArrayList<>();

            Map<LocalDate, AccountDailyMetrics> accountMetrics = metricsByAccountAndDate.getOrDefault(account.getId(), new HashMap<>());

            for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
                AccountDailyMetrics metrics = accountMetrics.get(date);
                long value = 0;
                if (metrics != null) {
                    value = switch (metricType) {
                        case "fans" -> metrics.getNewFans();
                        case "views" -> metrics.getDailyViews();
                        case "engagement" -> (long) (metrics.getDailyLikes() + metrics.getDailyComments() + metrics.getDailyShares() + metrics.getDailyCollects());
                        default -> 0;
                    };
                }
                platformTrend.add(new TrendDataVO(date, value, platformCode));
            }

            result.put(platformCode, platformTrend);
        }

        List<TrendDataVO> overallTrend = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            LocalDate currentDate = date;
            long totalValue = 0;
            for (CreatorAccount account : accounts) {
                Map<LocalDate, AccountDailyMetrics> accountMetrics = metricsByAccountAndDate.getOrDefault(account.getId(), new HashMap<>());
                AccountDailyMetrics metrics = accountMetrics.get(currentDate);
                if (metrics != null) {
                    totalValue += switch (metricType) {
                        case "fans" -> metrics.getNewFans();
                        case "views" -> metrics.getDailyViews();
                        case "engagement" -> (long) (metrics.getDailyLikes() + metrics.getDailyComments() + metrics.getDailyShares() + metrics.getDailyCollects());
                        default -> 0;
                    };
                }
            }
            overallTrend.add(new TrendDataVO(currentDate, totalValue, "ALL"));
        }
        result.put("ALL", overallTrend);

        return result;
    }

    public BigDecimal calculateGrowthRate(List<TrendDataVO> data, int periods) {
        if (data == null || data.size() < periods + 1) {
            return BigDecimal.ZERO;
        }

        List<TrendDataVO> recentData = data.subList(data.size() - periods, data.size());
        List<TrendDataVO> previousData = data.subList(data.size() - periods * 2, data.size() - periods);

        long recentSum = recentData.stream().mapToLong(TrendDataVO::getValue).sum();
        long previousSum = previousData.stream().mapToLong(TrendDataVO::getValue).sum();

        if (previousSum == 0) {
            return BigDecimal.ZERO;
        }

        return BigDecimal.valueOf(recentSum - previousSum)
                .divide(BigDecimal.valueOf(previousSum), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    public BigDecimal calculateMovingAverage(List<TrendDataVO> data, int windowSize) {
        if (data == null || data.size() < windowSize) {
            return BigDecimal.ZERO;
        }

        List<TrendDataVO> recentData = data.subList(data.size() - windowSize, data.size());
        long sum = recentData.stream().mapToLong(TrendDataVO::getValue).sum();
        return BigDecimal.valueOf(sum).divide(BigDecimal.valueOf(windowSize), 2, RoundingMode.HALF_UP);
    }

    public void evictCache(Long creatorId) {
        String pattern = TREND_CACHE_KEY + creatorId + "*";
        var keys = redisCacheService.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            redisCacheService.deleteBatch(keys);
        }
    }
}
