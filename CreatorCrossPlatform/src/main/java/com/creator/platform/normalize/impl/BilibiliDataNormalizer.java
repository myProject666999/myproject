package com.creator.platform.normalize.impl;

import com.creator.platform.dto.PlatformAccountDataDTO;
import com.creator.platform.dto.PlatformContentDTO;
import com.creator.platform.dto.UnifiedMetricsDTO;
import com.creator.platform.enums.PlatformCodeEnum;
import com.creator.platform.normalize.PlatformDataNormalizer;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class BilibiliDataNormalizer implements PlatformDataNormalizer {

    @Override
    public PlatformCodeEnum getPlatformCode() {
        return PlatformCodeEnum.BILIBILI;
    }

    @Override
    public UnifiedMetricsDTO normalizeAccountData(PlatformAccountDataDTO rawData) {
        UnifiedMetricsDTO unified = new UnifiedMetricsDTO();
        unified.setPlatformCode(PlatformCodeEnum.BILIBILI.getCode());

        unified.setTotalFans(rawData.getTotalFans());
        unified.setNewFans(rawData.getNewFans() != null ? rawData.getNewFans() : 0);
        unified.setLostFans(rawData.getLostFans() != null ? rawData.getLostFans() : 0);
        unified.setNetFans(unified.getNewFans() - unified.getLostFans());

        unified.setTotalViews(rawData.getTotalViews());
        unified.setDailyViews(rawData.getDailyViews() != null ? rawData.getDailyViews() : 0);

        unified.setTotalLikes(rawData.getTotalLikes());
        unified.setDailyLikes(rawData.getDailyLikes() != null ? rawData.getDailyLikes() : 0);

        unified.setTotalComments(rawData.getTotalComments());
        unified.setDailyComments(rawData.getDailyComments() != null ? rawData.getDailyComments() : 0);

        unified.setTotalShares(rawData.getTotalShares());
        unified.setDailyShares(rawData.getDailyShares() != null ? rawData.getDailyShares() : 0);

        unified.setTotalCollects(rawData.getTotalCollects());
        unified.setDailyCollects(rawData.getDailyCollects() != null ? rawData.getDailyCollects() : 0);

        calculateEngagementRate(unified);
        calculateTotalInteractions(unified);

        return unified;
    }

    @Override
    public UnifiedMetricsDTO normalizeContentData(PlatformContentDTO rawData) {
        UnifiedMetricsDTO unified = new UnifiedMetricsDTO();
        unified.setPlatformCode(PlatformCodeEnum.BILIBILI.getCode());

        unified.setTotalViews(rawData.getTotalViews() != null ? rawData.getTotalViews() : 0L);
        unified.setTotalLikes(rawData.getTotalLikes() != null ? rawData.getTotalLikes().longValue() : 0L);
        unified.setTotalComments(rawData.getTotalComments() != null ? rawData.getTotalComments().longValue() : 0L);
        unified.setTotalShares(rawData.getTotalShares() != null ? rawData.getTotalShares().longValue() : 0L);
        unified.setTotalCollects(rawData.getTotalCollects() != null ? rawData.getTotalCollects().longValue() : 0L);
        unified.setPlayCompletionRate(rawData.getCompleteRate());
        unified.setAverageWatchDuration(rawData.getAverageWatchTime());

        unified.setDailyLikes(0);
        unified.setDailyComments(0);
        unified.setDailyShares(0);
        unified.setDailyCollects(0);

        calculateEngagementRate(unified);
        calculateTotalInteractions(unified);

        return unified;
    }

    private void calculateEngagementRate(UnifiedMetricsDTO unified) {
        if (unified.getTotalViews() != null && unified.getTotalViews() > 0) {
            long interactions = unified.getTotalLikes() + unified.getTotalComments() + unified.getTotalShares() + unified.getTotalCollects();
            BigDecimal rate = BigDecimal.valueOf(interactions)
                    .divide(BigDecimal.valueOf(unified.getTotalViews()), 4, RoundingMode.HALF_UP);
            unified.setEngagementRate(rate);
        } else {
            unified.setEngagementRate(BigDecimal.ZERO);
        }
    }

    private void calculateTotalInteractions(UnifiedMetricsDTO unified) {
        long total = unified.getTotalLikes() + unified.getTotalComments() + unified.getTotalShares() + unified.getTotalCollects();
        int daily = unified.getDailyLikes() + unified.getDailyComments() + unified.getDailyShares() + unified.getDailyCollects();
        unified.setTotalInteractions(total);
        unified.setDailyInteractions(daily);
    }
}
