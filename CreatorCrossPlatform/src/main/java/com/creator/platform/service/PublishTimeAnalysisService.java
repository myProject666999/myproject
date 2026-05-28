package com.creator.platform.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.creator.platform.cache.RedisCacheService;
import com.creator.platform.entity.Content;
import com.creator.platform.entity.ContentMetrics;
import com.creator.platform.entity.CreatorAccount;
import com.creator.platform.entity.Platform;
import com.creator.platform.entity.PublishTimeAnalysis;
import com.creator.platform.mapper.ContentMapper;
import com.creator.platform.mapper.ContentMetricsMapper;
import com.creator.platform.mapper.CreatorAccountMapper;
import com.creator.platform.mapper.PlatformMapper;
import com.creator.platform.mapper.PublishTimeAnalysisMapper;
import com.creator.platform.vo.HourAnalysisVO;
import com.creator.platform.vo.PublishTimeAnalysisVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublishTimeAnalysisService {

    private final RedisCacheService redisCacheService;
    private final PublishTimeAnalysisMapper publishTimeAnalysisMapper;
    private final ContentMapper contentMapper;
    private final ContentMetricsMapper contentMetricsMapper;
    private final CreatorAccountMapper creatorAccountMapper;
    private final PlatformMapper platformMapper;

    private static final String ANALYSIS_CACHE_KEY = "publish:time:analysis:";
    private static final int CACHE_MINUTES = 60;
    private static final int ANALYSIS_DAYS = 30;

    public PublishTimeAnalysisVO getPublishTimeAnalysis(Long creatorId, Long platformId) {
        String cacheKey = ANALYSIS_CACHE_KEY + creatorId + ":" + (platformId != null ? platformId : "all");
        PublishTimeAnalysisVO cached = redisCacheService.get(cacheKey, PublishTimeAnalysisVO.class);
        if (cached != null) {
            return cached;
        }

        PublishTimeAnalysisVO vo = calculatePublishTimeAnalysis(creatorId, platformId);
        redisCacheService.set(cacheKey, vo, CACHE_MINUTES, TimeUnit.MINUTES);
        return vo;
    }

    @Transactional(rollbackFor = Exception.class)
    public void generatePublishTimeAnalysis(Long creatorId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(ANALYSIS_DAYS);

        List<CreatorAccount> accounts = getCreatorAccounts(creatorId);
        if (accounts.isEmpty()) {
            return;
        }

        for (CreatorAccount account : accounts) {
            analyzeAndSave(creatorId, account.getPlatformId(), startDate, endDate);
        }
    }

    private void analyzeAndSave(Long creatorId, Long platformId, LocalDate startDate, LocalDate endDate) {
        List<Content> contents = contentMapper.selectList(
                new LambdaQueryWrapper<Content>()
                        .eq(Content::getCreatorId, creatorId)
                        .eq(Content::getPlatformId, platformId)
                        .eq(Content::getStatus, 1)
                        .between(Content::getPublishTime, startDate.atStartOfDay(), endDate.atTime(23, 59, 59))
        );

        if (contents.isEmpty()) {
            return;
        }

        List<Long> contentIds = contents.stream().map(Content::getId).toList();
        Map<Long, ContentMetrics> metricsMap = contentMetricsMapper.selectList(
                new LambdaQueryWrapper<ContentMetrics>().in(ContentMetrics::getContentId, contentIds)
        ).stream().collect(Collectors.toMap(ContentMetrics::getContentId, m -> m));

        Map<Integer, List<Content>> contentsByHour = contents.stream()
                .collect(Collectors.groupingBy(Content::getPublishHour));

        for (Map.Entry<Integer, List<Content>> entry : contentsByHour.entrySet()) {
            Integer hour = entry.getKey();
            List<Content> hourContents = entry.getValue();

            int contentCount = hourContents.size();
            BigDecimal totalViews = BigDecimal.ZERO;
            BigDecimal totalLikes = BigDecimal.ZERO;
            BigDecimal totalEngagement = BigDecimal.ZERO;

            for (Content content : hourContents) {
                ContentMetrics metrics = metricsMap.get(content.getId());
                if (metrics != null) {
                    totalViews = totalViews.add(BigDecimal.valueOf(metrics.getTotalViews()));
                    totalLikes = totalLikes.add(BigDecimal.valueOf(metrics.getTotalLikes()));
                    totalEngagement = totalEngagement.add(metrics.getEngagementRate());
                }
            }

            BigDecimal avgViews = totalViews.divide(BigDecimal.valueOf(contentCount), 2, RoundingMode.HALF_UP);
            BigDecimal avgLikes = totalLikes.divide(BigDecimal.valueOf(contentCount), 2, RoundingMode.HALF_UP);
            BigDecimal avgEngagementRate = totalEngagement.divide(BigDecimal.valueOf(contentCount), 4, RoundingMode.HALF_UP);

            BigDecimal score = calculateScore(avgViews, avgLikes, avgEngagementRate);

            PublishTimeAnalysis analysis = new PublishTimeAnalysis();
            analysis.setCreatorId(creatorId);
            analysis.setPlatformId(platformId);
            analysis.setPublishHour(hour);
            analysis.setContentCount(contentCount);
            analysis.setAvgViews(avgViews);
            analysis.setAvgLikes(avgLikes);
            analysis.setAvgEngagementRate(avgEngagementRate);
            analysis.setScore(score);
            analysis.setStatStartDate(startDate);
            analysis.setStatEndDate(endDate);

            saveOrUpdateAnalysis(analysis);
        }
    }

    private void saveOrUpdateAnalysis(PublishTimeAnalysis analysis) {
        PublishTimeAnalysis existing = publishTimeAnalysisMapper.selectOne(
                new LambdaQueryWrapper<PublishTimeAnalysis>()
                        .eq(PublishTimeAnalysis::getCreatorId, analysis.getCreatorId())
                        .eq(PublishTimeAnalysis::getPlatformId, analysis.getPlatformId())
                        .eq(PublishTimeAnalysis::getPublishHour, analysis.getPublishHour())
        );

        if (existing == null) {
            publishTimeAnalysisMapper.insert(analysis);
        } else {
            analysis.setId(existing.getId());
            publishTimeAnalysisMapper.updateById(analysis);
        }
    }

    private PublishTimeAnalysisVO calculatePublishTimeAnalysis(Long creatorId, Long platformId) {
        PublishTimeAnalysisVO vo = new PublishTimeAnalysisVO();
        vo.setCreatorId(creatorId);
        vo.setPlatformId(platformId);

        if (platformId != null) {
            Platform platform = platformMapper.selectById(platformId);
            if (platform != null) {
                vo.setPlatformCode(platform.getPlatformCode());
                vo.setPlatformName(platform.getPlatformName());
            }
        }

        List<PublishTimeAnalysis> analysisList = publishTimeAnalysisMapper.selectList(
                new LambdaQueryWrapper<PublishTimeAnalysis>()
                        .eq(PublishTimeAnalysis::getCreatorId, creatorId)
                        .apply(platformId != null, "platform_id = {0}", platformId)
        );

        if (analysisList.isEmpty()) {
            vo.setHourAnalysis(new ArrayList<>());
            vo.setRecommendedHours(new ArrayList<>());
            return vo;
        }

        List<HourAnalysisVO> hourAnalysis = analysisList.stream()
                .map(a -> new HourAnalysisVO(
                        a.getPublishHour(),
                        a.getContentCount(),
                        a.getAvgViews(),
                        a.getAvgLikes(),
                        a.getAvgEngagementRate(),
                        a.getScore()
                ))
                .sorted(Comparator.comparing(HourAnalysisVO::getPublishHour))
                .toList();

        vo.setHourAnalysis(hourAnalysis);

        HourAnalysisVO bestHour = hourAnalysis.stream()
                .max(Comparator.comparing(HourAnalysisVO::getScore))
                .orElse(null);

        if (bestHour != null) {
            vo.setBestPublishHour(bestHour.getPublishHour());
            vo.setBestHourScore(bestHour.getScore());
            vo.setBestHourContentCount(bestHour.getContentCount());
            vo.setBestHourAvgViews(bestHour.getAvgViews());
            vo.setBestHourAvgEngagementRate(bestHour.getAvgEngagementRate());
        }

        List<Integer> recommendedHours = hourAnalysis.stream()
                .sorted(Comparator.comparing(HourAnalysisVO::getScore).reversed())
                .limit(5)
                .map(HourAnalysisVO::getPublishHour)
                .sorted()
                .toList();
        vo.setRecommendedHours(recommendedHours);

        return vo;
    }

    private BigDecimal calculateScore(BigDecimal avgViews, BigDecimal avgLikes, BigDecimal avgEngagementRate) {
        BigDecimal viewsScore = avgViews.divide(BigDecimal.valueOf(1000), 2, RoundingMode.HALF_UP);
        BigDecimal likesScore = avgLikes.divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal engagementScore = avgEngagementRate.multiply(BigDecimal.valueOf(100));

        return viewsScore.multiply(BigDecimal.valueOf(0.4))
                .add(likesScore.multiply(BigDecimal.valueOf(0.3)))
                .add(engagementScore.multiply(BigDecimal.valueOf(0.3)));
    }

    private List<CreatorAccount> getCreatorAccounts(Long creatorId) {
        return creatorAccountMapper.selectList(
                new LambdaQueryWrapper<CreatorAccount>()
                        .eq(CreatorAccount::getCreatorId, creatorId)
                        .eq(CreatorAccount::getStatus, 1)
        );
    }

    public void evictCache(Long creatorId) {
        String pattern = ANALYSIS_CACHE_KEY + creatorId + "*";
        var keys = redisCacheService.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            redisCacheService.deleteBatch(keys);
        }
    }
}
