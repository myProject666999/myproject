package com.creator.platform.dto.douyin;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DouyinAccountDataDTO {

    private String openId;
    private String nickname;
    private String avatar;

    private Long followerCount;
    private Long followingCount;
    private Long totalFavorited;

    private Long newFollower;
    private Long loseFollower;

    private Long totalPlayCount;
    private Long dailyPlayCount;

    private Long totalDiggCount;
    private Long dailyDiggCount;

    private Long totalCommentCount;
    private Long dailyCommentCount;

    private Long totalShareCount;
    private Long dailyShareCount;

    private Long totalCollectCount;
    private Long dailyCollectCount;

    private BigDecimal interactionRate;
}
