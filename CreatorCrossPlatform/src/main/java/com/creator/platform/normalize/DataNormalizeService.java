package com.creator.platform.normalize;

import com.creator.platform.dto.PlatformAccountDataDTO;
import com.creator.platform.dto.PlatformContentDTO;
import com.creator.platform.dto.UnifiedMetricsDTO;
import com.creator.platform.entity.AccountDailyMetrics;
import com.creator.platform.entity.Content;
import com.creator.platform.entity.ContentMetrics;
import com.creator.platform.enums.PlatformCodeEnum;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DataNormalizeService {

    private final List<PlatformDataNormalizer> normalizers;
    private Map<PlatformCodeEnum, PlatformDataNormalizer> normalizerMap;

    @PostConstruct
    public void init() {
        normalizerMap = new EnumMap<>(PlatformCodeEnum.class);
        for (PlatformDataNormalizer normalizer : normalizers) {
            normalizerMap.put(normalizer.getPlatformCode(), normalizer);
        }
    }

    public UnifiedMetricsDTO normalizeAccountData(PlatformAccountDataDTO rawData) {
        PlatformCodeEnum platformCode = PlatformCodeEnum.getByCode(rawData.getPlatformCode());
        if (platformCode == null) {
            throw new IllegalArgumentException("不支持的平台: " + rawData.getPlatformCode());
        }
        PlatformDataNormalizer normalizer = normalizerMap.get(platformCode);
        if (normalizer == null) {
            throw new IllegalArgumentException("未找到平台数据归一化器: " + rawData.getPlatformCode());
        }
        return normalizer.normalizeAccountData(rawData);
    }

    public UnifiedMetricsDTO normalizeContentData(PlatformContentDTO rawData) {
        PlatformCodeEnum platformCode = PlatformCodeEnum.getByCode(rawData.getPlatformCode());
        if (platformCode == null) {
            throw new IllegalArgumentException("不支持的平台: " + rawData.getPlatformCode());
        }
        PlatformDataNormalizer normalizer = normalizerMap.get(platformCode);
        if (normalizer == null) {
            throw new IllegalArgumentException("未找到平台数据归一化器: " + rawData.getPlatformCode());
        }
        return normalizer.normalizeContentData(rawData);
    }

    public AccountDailyMetrics convertToAccountDailyMetrics(UnifiedMetricsDTO unified, Long creatorId, Long accountId, Long platformId) {
        AccountDailyMetrics metrics = new AccountDailyMetrics();
        metrics.setCreatorId(creatorId);
        metrics.setAccountId(accountId);
        metrics.setPlatformId(platformId);
        metrics.setStatDate(unified.getStatDate());
        metrics.setTotalFans(unified.getTotalFans() != null ? unified.getTotalFans() : 0L);
        metrics.setNewFans(unified.getNewFans() != null ? unified.getNewFans() : 0);
        metrics.setLostFans(unified.getLostFans() != null ? unified.getLostFans() : 0);
        metrics.setTotalViews(unified.getTotalViews() != null ? unified.getTotalViews() : 0L);
        metrics.setDailyViews(unified.getDailyViews() != null ? unified.getDailyViews() : 0);
        metrics.setTotalLikes(unified.getTotalLikes() != null ? unified.getTotalLikes() : 0L);
        metrics.setDailyLikes(unified.getDailyLikes() != null ? unified.getDailyLikes() : 0);
        metrics.setTotalComments(unified.getTotalComments() != null ? unified.getTotalComments() : 0L);
        metrics.setDailyComments(unified.getDailyComments() != null ? unified.getDailyComments() : 0);
        metrics.setTotalShares(unified.getTotalShares() != null ? unified.getTotalShares() : 0L);
        metrics.setDailyShares(unified.getDailyShares() != null ? unified.getDailyShares() : 0);
        metrics.setTotalCollects(unified.getTotalCollects() != null ? unified.getTotalCollects() : 0L);
        metrics.setDailyCollects(unified.getDailyCollects() != null ? unified.getDailyCollects() : 0);
        metrics.setEngagementRate(unified.getEngagementRate() != null ? unified.getEngagementRate() : BigDecimal.ZERO);
        return metrics;
    }

    public Content convertToContent(PlatformContentDTO dto, Long creatorId, Long accountId, Long platformId) {
        Content content = new Content();
        content.setCreatorId(creatorId);
        content.setAccountId(accountId);
        content.setPlatformId(platformId);
        content.setPlatformContentId(dto.getPlatformContentId());
        content.setContentTitle(dto.getContentTitle());
        content.setContentType(dto.getContentType());
        content.setContentCover(dto.getContentCover());
        content.setContentUrl(dto.getContentUrl());
        content.setPublishTime(dto.getPublishTime());
        content.setPublishHour(dto.getPublishTime().getHour());
        DayOfWeek dayOfWeek = dto.getPublishTime().getDayOfWeek();
        content.setPublishWeekday(dayOfWeek.getValue());
        content.setDuration(dto.getDuration());
        content.setTags(dto.getTags());
        content.setStatus(1);
        return content;
    }

    public ContentMetrics convertToContentMetrics(UnifiedMetricsDTO unified, Long contentId, Long creatorId, Long accountId, Long platformId) {
        ContentMetrics metrics = new ContentMetrics();
        metrics.setContentId(contentId);
        metrics.setCreatorId(creatorId);
        metrics.setAccountId(accountId);
        metrics.setPlatformId(platformId);
        metrics.setTotalViews(unified.getTotalViews() != null ? unified.getTotalViews() : 0L);
        metrics.setTotalLikes(unified.getTotalLikes() != null ? unified.getTotalLikes().intValue() : 0);
        metrics.setTotalComments(unified.getTotalComments() != null ? unified.getTotalComments().intValue() : 0);
        metrics.setTotalShares(unified.getTotalShares() != null ? unified.getTotalShares().intValue() : 0);
        metrics.setTotalCollects(unified.getTotalCollects() != null ? unified.getTotalCollects().intValue() : 0);
        metrics.setCompleteRate(unified.getPlayCompletionRate());
        metrics.setAverageWatchTime(unified.getAverageWatchDuration());
        metrics.setEngagementRate(unified.getEngagementRate() != null ? unified.getEngagementRate() : BigDecimal.ZERO);
        metrics.setHotValue(calculateHotValue(unified));
        return metrics;
    }

    private BigDecimal calculateHotValue(UnifiedMetricsDTO unified) {
        long views = unified.getTotalViews() != null ? unified.getTotalViews() : 0L;
        long likes = unified.getTotalLikes() != null ? unified.getTotalLikes() : 0L;
        long comments = unified.getTotalComments() != null ? unified.getTotalComments() : 0L;
        long shares = unified.getTotalShares() != null ? unified.getTotalShares() : 0L;
        long collects = unified.getTotalCollects() != null ? unified.getTotalCollects() : 0L;

        double hotValue = views * 1.0 + likes * 10.0 + comments * 20.0 + shares * 30.0 + collects * 15.0;
        return BigDecimal.valueOf(hotValue);
    }
}
