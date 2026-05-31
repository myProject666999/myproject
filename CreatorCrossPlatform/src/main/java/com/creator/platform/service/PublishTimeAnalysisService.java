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
    private static final int ANALYSIS_DAYS = 365;

    public PublishTimeAnalysisVO getPublishTimeAnalysis(Long creatorId, Long platformId) {
        try {
            String cacheKey = ANALYSIS_CACHE_KEY + creatorId + ":" + (platformId != null ? platformId : "all");
            PublishTimeAnalysisVO cached = null;
            try {
                cached = redisCacheService.get(cacheKey, PublishTimeAnalysisVO.class);
            } catch (Exception e) {
                log.warn("Redis缓存读取失败", e);
            }
            if (cached != null) {
                return cached;
            }

            PublishTimeAnalysisVO vo = calculatePublishTimeAnalysis(creatorId, platformId);
            try {
                redisCacheService.set(cacheKey, vo, CACHE_MINUTES, TimeUnit.MINUTES);
            } catch (Exception e) {
                log.warn("Redis缓存写入失败", e);
            }
            return vo;
        } catch (Exception e) {
            log.error("获取发布时段分析失败", e);
            PublishTimeAnalysisVO vo = new PublishTimeAnalysisVO();
            vo.setCreatorId(creatorId);
            vo.setPlatformId(platformId);
            vo.setHourAnalysis(new ArrayList<>());
            vo.setRecommendedHours(new ArrayList<>());
            return vo;
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void generatePublishTimeAnalysis(Long creatorId) {
        try {
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusDays(ANALYSIS_DAYS);

            List<CreatorAccount> accounts = getCreatorAccounts(creatorId);
            if (accounts.isEmpty()) {
                log.warn("没有找到创作者的账号，creatorId: {}", creatorId);
                return;
            }
            log.info("开始生成发布时段分析，creatorId: {}, 账号数: {}", creatorId, accounts.size());

            for (CreatorAccount account : accounts) {
                analyzeAndSave(creatorId, account.getPlatformId(), startDate, endDate);
            }
            evictCache(creatorId);
            log.info("发布时段分析生成完成，creatorId: {}", creatorId);
        } catch (Exception e) {
            log.error("生成发布时段分析失败", e);
            throw new RuntimeException("生成发布时段分析失败", e);
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
                        .eq(platformId != null, PublishTimeAnalysis::getPlatformId, platformId)
        );

        if (analysisList.isEmpty()) {
            vo.setHourAnalysis(new ArrayList<>());
            vo.setRecommendedHours(new ArrayList<>());
            return vo;
        }

        List<HourAnalysisVO> hourAnalysis;
        if (platformId == null) {
            Map<Integer, List<PublishTimeAnalysis>> groupedByHour = analysisList.stream()
                    .collect(Collectors.groupingBy(PublishTimeAnalysis::getPublishHour));
            
            hourAnalysis = groupedByHour.entrySet().stream()
                    .map(entry -> {
                        Integer hour = entry.getKey();
                        List<PublishTimeAnalysis> hourData = entry.getValue();
                        
                        int totalContentCount = hourData.stream()
                                .mapToInt(PublishTimeAnalysis::getContentCount)
                                .sum();
                        
                        BigDecimal totalWeight = hourData.stream()
                                .map(a -> BigDecimal.valueOf(a.getContentCount()))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                        
                        BigDecimal avgViews = hourData.stream()
                                .map(a -> a.getAvgViews().multiply(BigDecimal.valueOf(a.getContentCount())))
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                                .divide(totalWeight.max(BigDecimal.ONE), 2, RoundingMode.HALF_UP);
                        
                        BigDecimal avgLikes = hourData.stream()
                                .map(a -> a.getAvgLikes().multiply(BigDecimal.valueOf(a.getContentCount())))
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                                .divide(totalWeight.max(BigDecimal.ONE), 2, RoundingMode.HALF_UP);
                        
                        BigDecimal avgEngagementRate = hourData.stream()
                                .map(a -> a.getAvgEngagementRate().multiply(BigDecimal.valueOf(a.getContentCount())))
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                                .divide(totalWeight.max(BigDecimal.ONE), 4, RoundingMode.HALF_UP);
                        
                        BigDecimal score = calculateScore(avgViews, avgLikes, avgEngagementRate);
                        
                        return new HourAnalysisVO(
                                hour,
                                totalContentCount,
                                avgViews,
                                avgLikes,
                                avgEngagementRate,
                                score
                        );
                    })
                    .sorted(Comparator.comparing(HourAnalysisVO::getPublishHour))
                    .toList();
        } else {
            hourAnalysis = analysisList.stream()
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
        }

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
