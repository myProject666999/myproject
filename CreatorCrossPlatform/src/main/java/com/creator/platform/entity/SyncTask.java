package com.creator.platform.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.creator.platform.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sync_task")
public class SyncTask extends BaseEntity {

    private String taskType;

    private Long accountId;

    private Long creatorId;

    private LocalDate syncDate;

    private Integer status;

    private Integer retryCount;

    private Integer maxRetry;

    private String errorMessage;

    private LocalDateTime executeStartTime;

    private LocalDateTime executeEndTime;
}
