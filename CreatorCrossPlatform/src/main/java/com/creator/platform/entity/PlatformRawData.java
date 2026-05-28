package com.creator.platform.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.creator.platform.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("platform_raw_data")
public class PlatformRawData extends BaseEntity {

    private Long platformId;

    private Long accountId;

    private String dataType;

    private String rawData;

    private LocalDateTime fetchTime;

    private LocalDate dataDate;
}
