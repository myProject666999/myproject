package com.creator.platform.sync.impl;

import cn.hutool.core.util.RandomUtil;
import com.creator.platform.dto.PlatformAccountDataDTO;
import com.creator.platform.dto.PlatformContentDTO;
import com.creator.platform.enums.ContentTypeEnum;
import com.creator.platform.enums.PlatformCodeEnum;
import com.creator.platform.sync.PlatformApiClient;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DouyinApiClient implements PlatformApiClient {

    @Override
    public String getPlatformCode() {
        return PlatformCodeEnum.DOUYIN.getCode();
    }

    @Override
    public PlatformAccountDataDTO fetchAccountData(String platformAccountId, String accessToken) throws Exception {
        if (RandomUtil.randomInt(1, 100) <= 5) {
            throw new RuntimeException("抖音API调用失败：网络超时");
        }

        PlatformAccountDataDTO dto = new PlatformAccountDataDTO();
        dto.setPlatformCode(PlatformCodeEnum.DOUYIN.getCode());
        dto.setPlatformAccountId(platformAccountId);
        dto.setPlatformAccountName("抖音创作者" + platformAccountId);
        dto.setPlatformAccountAvatar("https://example.com/avatar/" + platformAccountId + ".jpg");

        dto.setTotalFans(RandomUtil.randomLong(10000L, 1000000L));
        dto.setNewFans(RandomUtil.randomInt(10, 500));
        dto.setLostFans(RandomUtil.randomInt(5, 100));

        dto.setTotalViews(RandomUtil.randomLong(100000L, 10000000L));
        dto.setDailyViews(RandomUtil.randomInt(1000, 50000));

        dto.setTotalLikes(RandomUtil.randomLong(50000L, 5000000L));
        dto.setDailyLikes(RandomUtil.randomInt(500, 20000));

        dto.setTotalComments(RandomUtil.randomLong(10000L, 1000000L));
        dto.setDailyComments(RandomUtil.randomInt(100, 5000));

        dto.setTotalShares(RandomUtil.randomLong(5000L, 500000L));
        dto.setDailyShares(RandomUtil.randomInt(50, 2000));

        dto.setTotalCollects(RandomUtil.randomLong(10000L, 1000000L));
        dto.setDailyCollects(RandomUtil.randomInt(100, 5000));

        BigDecimal interactionRate = BigDecimal.valueOf(dto.getDailyLikes() + dto.getDailyComments() + dto.getDailyShares())
                .divide(BigDecimal.valueOf(dto.getDailyViews()), 4, RoundingMode.HALF_UP);
        dto.setEngagementRate(interactionRate);

        return dto;
    }

    @Override
    public List<PlatformContentDTO> fetchContentList(String platformAccountId, String accessToken, LocalDate startDate, LocalDate endDate) throws Exception {
        if (RandomUtil.randomInt(1, 100) <= 5) {
            throw new RuntimeException("抖音API调用失败：内容列表获取失败");
        }

        List<PlatformContentDTO> contentList = new ArrayList<>();
        int count = RandomUtil.randomInt(3, 10);

        for (int i = 0; i < count; i++) {
            PlatformContentDTO dto = new PlatformContentDTO();
            dto.setPlatformCode(PlatformCodeEnum.DOUYIN.getCode());
            dto.setPlatformAccountId(platformAccountId);
            dto.setPlatformContentId("DY" + System.currentTimeMillis() + i);

            dto.setContentTitle("抖音视频标题" + (i + 1));
            dto.setContentType(ContentTypeEnum.VIDEO.getCode());
            dto.setContentCover("https://example.com/cover/" + dto.getPlatformContentId() + ".jpg");
            dto.setContentUrl("https://www.douyin.com/video/" + dto.getPlatformContentId());

            LocalDateTime publishTime = LocalDateTime.of(
                    RandomUtil.randomInt(startDate.getYear(), endDate.getYear() + 1),
                    RandomUtil.randomInt(1, 13),
                    RandomUtil.randomInt(1, 29),
                    RandomUtil.randomInt(6, 24),
                    RandomUtil.randomInt(0, 60)
            );
            dto.setPublishTime(publishTime);
            dto.setDuration(RandomUtil.randomInt(15, 300));
            dto.setTags("搞笑,生活,日常");

            dto.setTotalViews(RandomUtil.randomLong(1000L, 1000000L));
            dto.setTotalLikes(RandomUtil.randomInt(100, 50000));
            dto.setTotalComments(RandomUtil.randomInt(10, 5000));
            dto.setTotalShares(RandomUtil.randomInt(5, 2000));
            dto.setTotalCollects(RandomUtil.randomInt(10, 5000));

            dto.setCompleteRate(BigDecimal.valueOf(RandomUtil.randomDouble(0.3, 0.95)));
            dto.setAverageWatchTime(BigDecimal.valueOf(RandomUtil.randomDouble(10, dto.getDuration() * 0.8)));

            contentList.add(dto);
        }

        return contentList;
    }
}
