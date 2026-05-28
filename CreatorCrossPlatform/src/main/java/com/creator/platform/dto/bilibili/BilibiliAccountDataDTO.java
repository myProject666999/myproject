package com.creator.platform.dto.bilibili;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class BilibiliAccountDataDTO {

    private String mid;
    private String name;
    private String face;

    private Long follower;
    private Long attention;

    private Long fansIncrease;
    private Long fansDecrease;

    private Long totalView;
    private Long view;

    private Long totalLike;
    private Long likes;

    private Long totalReply;
    private Long reply;

    private Long totalShare;
    private Long share;

    private Long totalFavorite;
    private Long favorite;

    private Long totalCoin;
    private Long coin;

    private BigDecimal archiveViewRate;
}
