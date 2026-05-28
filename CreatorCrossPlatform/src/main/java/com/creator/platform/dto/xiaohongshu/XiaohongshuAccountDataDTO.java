package com.creator.platform.dto.xiaohongshu;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class XiaohongshuAccountDataDTO {

    private String userId;
    private String nickname;
    private String avatar;

    private Long fans;
    private Long follows;

    private Long newFans;
    private Long lostFans;

    private Long totalViewed;
    private Long viewed;

    private Long totalLiked;
    private Long liked;

    private Long totalCommented;
    private Long commented;

    private Long totalShared;
    private Long shared;

    private Long totalCollected;
    private Long collected;

    private BigDecimal interactRate;
}
