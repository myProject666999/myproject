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
public class BilibiliApiClient implements PlatformApiClient {

    @Override
    public String getPlatformCode() {
        return PlatformCodeEnum.BILIBILI.getCode();
    }

    @Override
    public PlatformAccountDataDTO fetchAccountData(String platformAccountId, String accessToken) throws Exception {
        if (RandomUtil.randomInt(1, 100) <= 5) {
            throw new RuntimeException("B站API调用失败：接口限流");
        }

        PlatformAccountDataDTO dto = new PlatformAccountDataDTO();
        dto.setPlatformCode(PlatformCodeEnum.BILIBILI.getCode());
        dto.setPlatformAccountId(platformAccountId);
        dto.setPlatformAccountName("B站UP主" + platformAccountId);
        dto.setPlatformAccountAvatar("https://example.com/avatar/b" + platformAccountId + ".jpg");

        dto.setTotalFans(RandomUtil.randomLong(5000L, 500000L));
        dto.setNewFans(RandomUtil.randomInt(5, 300));
        dto.setLostFans(RandomUtil.randomInt(2, 50));

        dto.setTotalViews(RandomUtil.randomLong(50000L, 5000000L));
        dto.setDailyViews(RandomUtil.randomInt(500, 30000));

        dto.setTotalLikes(RandomUtil.randomLong(20000L, 2000000L));
        dto.setDailyLikes(RandomUtil.randomInt(200, 10000));

        dto.setTotalComments(RandomUtil.randomLong(5000L, 500000L));
        dto.setDailyComments(RandomUtil.randomInt(50, 3000));

        dto.setTotalShares(RandomUtil.randomLong(2000L, 200000L));
        dto.setDailyShares(RandomUtil.randomInt(20, 1000));

        dto.setTotalCollects(RandomUtil.randomLong(10000L, 1000000L));
        dto.setDailyCollects(RandomUtil.randomInt(100, 5000));

        BigDecimal interactionRate = BigDecimal.valueOf(dto.getDailyLikes() + dto.getDailyComments() + dto.getDailyShares() + dto.getDailyCollects())
                .divide(BigDecimal.valueOf(dto.getDailyViews()), 4, RoundingMode.HALF_UP);
        dto.setEngagementRate(interactionRate);

        return dto;
    }

    @Override
    public List<PlatformContentDTO> fetchContentList(String platformAccountId, String accessToken, LocalDate startDate, LocalDate endDate) throws Exception {
        if (RandomUtil.randomInt(1, 100) <= 5) {
            throw new RuntimeException("B站API调用失败：内容列表获取失败");
        }

        List<PlatformContentDTO> contentList = new ArrayList<>();
        int count = RandomUtil.randomInt(2, 8);

        for (int i = 0; i < count; i++) {
            PlatformContentDTO dto = new PlatformContentDTO();
            dto.setPlatformCode(PlatformCodeEnum.BILIBILI.getCode());
            dto.setPlatformAccountId(platformAccountId);
            dto.setPlatformContentId("BV" + RandomUtil.randomString(10));

            dto.setContentTitle("B站视频标题" + (i + 1));
            dto.setContentType(ContentTypeEnum.VIDEO.getCode());
            dto.setContentCover("https://example.com/cover/b" + dto.getPlatformContentId() + ".jpg");
            dto.setContentUrl("https://www.bilibili.com/video/" + dto.getPlatformContentId());

            LocalDateTime publishTime = LocalDateTime.of(
                    RandomUtil.randomInt(startDate.getYear(), endDate.getYear() + 1),
                    RandomUtil.randomInt(1, 13),
                    RandomUtil.randomInt(1, 29),
                    RandomUtil.randomInt(10, 24),
                    RandomUtil.randomInt(0, 60)
            );
            dto.setPublishTime(publishTime);
            dto.setDuration(RandomUtil.randomInt(60, 1800));
            dto.setTags("科技,数码,测评");

            dto.setTotalViews(RandomUtil.randomLong(500L, 500000L));
            dto.setTotalLikes(RandomUtil.randomInt(50, 30000));
            dto.setTotalComments(RandomUtil.randomInt(10, 3000));
            dto.setTotalShares(RandomUtil.randomInt(5, 1000));
            dto.setTotalCollects(RandomUtil.randomInt(20, 10000));

            dto.setCompleteRate(BigDecimal.valueOf(RandomUtil.randomDouble(0.2, 0.9)));
            dto.setAverageWatchTime(BigDecimal.valueOf(RandomUtil.randomDouble(30, dto.getDuration() * 0.7)));

            contentList.add(dto);
        }

        return contentList;
    }
}
