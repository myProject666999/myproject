package com.creator.platform.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.creator.platform.cache.RedisCacheService;
import com.creator.platform.entity.Content;
import com.creator.platform.entity.ContentMetrics;
import com.creator.platform.entity.Platform;
import com.creator.platform.mapper.ContentMapper;
import com.creator.platform.mapper.ContentMetricsMapper;
import com.creator.platform.mapper.PlatformMapper;
import com.creator.platform.vo.ContentRankVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContentRankService {

    private final RedisCacheService redisCacheService;
    private final ContentMapper contentMapper;
    private final ContentMetricsMapper contentMetricsMapper;
    private final PlatformMapper platformMapper;

    private static final String RANK_CACHE_KEY = "content:rank:";
    private static final int CACHE_MINUTES = 15;

    public Page<ContentRankVO> getContentRank(Long creatorId, Long platformId, String sortBy, Integer pageNum, Integer pageSize) {
        String cacheKey = RANK_CACHE_KEY + creatorId + ":" + (platformId != null ? platformId : "all") + ":" + sortBy + ":" + pageNum + ":" + pageSize;
        @SuppressWarnings("unchecked")
        Page<ContentRankVO> cached = (Page<ContentRankVO>) redisCacheService.get(cacheKey);
        if (cached != null) {
            return cached;
        }

        Page<ContentRankVO> result = getContentRankFromDB(creatorId, platformId, sortBy, pageNum, pageSize);
        redisCacheService.set(cacheKey, result, CACHE_MINUTES, TimeUnit.MINUTES);
        return result;
    }

    private Page<ContentRankVO> getContentRankFromDB(Long creatorId, Long platformId, String sortBy, Integer pageNum, Integer pageSize) {
        Map<Long, Platform> platformMap = platformMapper.selectList(null).stream()
                .collect(Collectors.toMap(Platform::getId, p -> p));

        LambdaQueryWrapper<Content> contentQuery = new LambdaQueryWrapper<Content>()
                .eq(Content::getCreatorId, creatorId)
                .eq(Content::getStatus, 1);

        if (platformId != null) {
            contentQuery.eq(Content::getPlatformId, platformId);
        }

        Page<Content> contentPage = contentMapper.selectPage(new Page<>(pageNum, pageSize), contentQuery);

        List<Long> contentIds = contentPage.getRecords().stream().map(Content::getId).toList();

        Map<Long, ContentMetrics> metricsMap = contentMetricsMapper.selectList(
                new LambdaQueryWrapper<ContentMetrics>().in(ContentMetrics::getContentId, contentIds)
        ).stream().collect(Collectors.toMap(ContentMetrics::getContentId, m -> m));

        List<ContentRankVO> rankList = new ArrayList<>();
        int rank = (pageNum - 1) * pageSize + 1;

        List<ContentRankVO> voList = contentPage.getRecords().stream().map(content -> {
            ContentMetrics metrics = metricsMap.get(content.getId());
            Platform platform = platformMap.get(content.getPlatformId());

            ContentRankVO vo = new ContentRankVO();
            vo.setContentId(content.getId());
            vo.setPlatformId(content.getPlatformId());
            vo.setPlatformCode(platform != null ? platform.getPlatformCode() : null);
            vo.setPlatformName(platform != null ? platform.getPlatformName() : null);
            vo.setPlatformContentId(content.getPlatformContentId());
            vo.setContentTitle(content.getContentTitle());
            vo.setContentType(content.getContentType());
            vo.setContentCover(content.getContentCover());
            vo.setContentUrl(content.getContentUrl());
            vo.setPublishTime(content.getPublishTime());
            vo.setPublishHour(content.getPublishHour());
            vo.setPublishWeekday(content.getPublishWeekday());
            vo.setDuration(content.getDuration());
            vo.setTags(content.getTags());

            if (metrics != null) {
                vo.setTotalViews(metrics.getTotalViews());
                vo.setTotalLikes(metrics.getTotalLikes());
                vo.setTotalComments(metrics.getTotalComments());
                vo.setTotalShares(metrics.getTotalShares());
                vo.setTotalCollects(metrics.getTotalCollects());
                vo.setCompleteRate(metrics.getCompleteRate());
                vo.setAverageWatchTime(metrics.getAverageWatchTime());
                vo.setEngagementRate(metrics.getEngagementRate());
                vo.setHotValue(metrics.getHotValue());
            }

            return vo;
        }).toList();

        voList = sortContentList(voList, sortBy);

        for (ContentRankVO vo : voList) {
            vo.setRank(rank++);
            rankList.add(vo);
        }

        Page<ContentRankVO> resultPage = new Page<>(pageNum, pageSize, contentPage.getTotal());
        resultPage.setRecords(rankList);
        return resultPage;
    }

    private List<ContentRankVO> sortContentList(List<ContentRankVO> list, String sortBy) {
        return list.stream().sorted((a, b) -> {
            int compare = 0;
            switch (sortBy != null ? sortBy : "hotValue") {
                case "views" -> compare = Long.compare(b.getTotalViews() != null ? b.getTotalViews() : 0,
                        a.getTotalViews() != null ? a.getTotalViews() : 0);
                case "likes" -> compare = Integer.compare(b.getTotalLikes() != null ? b.getTotalLikes() : 0,
                        a.getTotalLikes() != null ? a.getTotalLikes() : 0);
                case "comments" -> compare = Integer.compare(b.getTotalComments() != null ? b.getTotalComments() : 0,
                        a.getTotalComments() != null ? a.getTotalComments() : 0);
                case "shares" -> compare = Integer.compare(b.getTotalShares() != null ? b.getTotalShares() : 0,
                        a.getTotalShares() != null ? a.getTotalShares() : 0);
                case "engagement" -> compare = (b.getEngagementRate() != null ? b.getEngagementRate() : BigDecimal.ZERO)
                        .compareTo(a.getEngagementRate() != null ? a.getEngagementRate() : BigDecimal.ZERO);
                default -> compare = (b.getHotValue() != null ? b.getHotValue() : BigDecimal.ZERO)
                        .compareTo(a.getHotValue() != null ? a.getHotValue() : BigDecimal.ZERO);
            }
            return compare;
        }).collect(Collectors.toList());
    }

    public List<ContentRankVO> getTopContents(Long creatorId, Long platformId, int limit, String sortBy) {
        return getContentRank(creatorId, platformId, sortBy, 1, limit).getRecords();
    }

    public void evictCache(Long creatorId) {
        String pattern = RANK_CACHE_KEY + creatorId + "*";
        var keys = redisCacheService.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            redisCacheService.deleteBatch(keys);
        }
    }
}
