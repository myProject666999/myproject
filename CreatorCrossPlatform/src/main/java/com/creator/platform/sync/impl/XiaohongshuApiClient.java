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
public class XiaohongshuApiClient implements PlatformApiClient {

    @Override
    public String getPlatformCode() {
        return PlatformCodeEnum.XIAOHONGSHU.getCode();
    }

    @Override
    public PlatformAccountDataDTO fetchAccountData(String platformAccountId, String accessToken) throws Exception {
        if (RandomUtil.randomInt(1, 100) <= 5) {
            throw new RuntimeException("小红书API调用失败：权限验证失败");
        }

        PlatformAccountDataDTO dto = new PlatformAccountDataDTO();
        dto.setPlatformCode(PlatformCodeEnum.XIAOHONGSHU.getCode());
        dto.setPlatformAccountId(platformAccountId);
        dto.setPlatformAccountName("小红书博主" + platformAccountId);
        dto.setPlatformAccountAvatar("https://example.com/avatar/x" + platformAccountId + ".jpg");

        dto.setTotalFans(RandomUtil.randomLong(2000L, 200000L));
        dto.setNewFans(RandomUtil.randomInt(3, 200));
        dto.setLostFans(RandomUtil.randomInt(1, 30));

        dto.setTotalViews(RandomUtil.randomLong(20000L, 2000000L));
        dto.setDailyViews(RandomUtil.randomInt(200, 20000));

        dto.setTotalLikes(RandomUtil.randomLong(10000L, 1000000L));
        dto.setDailyLikes(RandomUtil.randomInt(100, 10000));

        dto.setTotalComments(RandomUtil.randomLong(2000L, 200000L));
        dto.setDailyComments(RandomUtil.randomInt(20, 2000));

        dto.setTotalShares(RandomUtil.randomLong(1000L, 100000L));
        dto.setDailyShares(RandomUtil.randomInt(10, 1000));

        dto.setTotalCollects(RandomUtil.randomLong(5000L, 500000L));
        dto.setDailyCollects(RandomUtil.randomInt(50, 5000));

        BigDecimal interactionRate = BigDecimal.valueOf(dto.getDailyLikes() + dto.getDailyComments() + dto.getDailyShares() + dto.getDailyCollects())
                .divide(BigDecimal.valueOf(dto.getDailyViews()), 4, RoundingMode.HALF_UP);
        dto.setEngagementRate(interactionRate);

        return dto;
    }

    @Override
    public List<PlatformContentDTO> fetchContentList(String platformAccountId, String accessToken, LocalDate startDate, LocalDate endDate) throws Exception {
        if (RandomUtil.randomInt(1, 100) <= 5) {
            throw new RuntimeException("小红书API调用失败：内容列表获取失败");
        }

        List<PlatformContentDTO> contentList = new ArrayList<>();
        int count = RandomUtil.randomInt(3, 12);

        for (int i = 0; i < count; i++) {
            PlatformContentDTO dto = new PlatformContentDTO();
            dto.setPlatformCode(PlatformCodeEnum.XIAOHONGSHU.getCode());
            dto.setPlatformAccountId(platformAccountId);
            dto.setPlatformContentId("XHS" + System.currentTimeMillis() + i);

            dto.setContentTitle("小红书笔记标题" + (i + 1));
            dto.setContentType(RandomUtil.randomInt(0, 2) == 0 ? ContentTypeEnum.IMAGE.getCode() : ContentTypeEnum.ARTICLE.getCode());
            dto.setContentCover("https://example.com/cover/x" + dto.getPlatformContentId() + ".jpg");
            dto.setContentUrl("https://www.xiaohongshu.com/discovery/item/" + dto.getPlatformContentId());

            LocalDateTime publishTime = LocalDateTime.of(
                    RandomUtil.randomInt(startDate.getYear(), endDate.getYear() + 1),
                    RandomUtil.randomInt(1, 13),
                    RandomUtil.randomInt(1, 29),
                    RandomUtil.randomInt(8, 23),
                    RandomUtil.randomInt(0, 60)
            );
            dto.setPublishTime(publishTime);
            dto.setTags("穿搭,美妆,护肤");

            dto.setTotalViews(RandomUtil.randomLong(200L, 200000L));
            dto.setTotalLikes(RandomUtil.randomInt(20, 20000));
            dto.setTotalComments(RandomUtil.randomInt(5, 2000));
            dto.setTotalShares(RandomUtil.randomInt(2, 1000));
            dto.setTotalCollects(RandomUtil.randomInt(10, 10000));

            contentList.add(dto);
        }

        return contentList;
    }
}
