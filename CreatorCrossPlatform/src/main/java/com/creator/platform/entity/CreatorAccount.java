package com.creator.platform.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.creator.platform.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("creator_account")
public class CreatorAccount extends BaseEntity {

    private Long creatorId;

    private Long platformId;

    private String platformAccountId;

    private String platformAccountName;

    private String platformAccountAvatar;

    private String accessToken;

    private String refreshToken;

    private LocalDateTime tokenExpireTime;

    private LocalDateTime bindTime;

    private LocalDateTime lastSyncTime;

    private Integer syncStatus;

    private Integer status;
}
