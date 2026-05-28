package com.project.cost.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("proj_report_cache")
public class ReportCache {
    @TableId(type = IdType.AUTO)
    private Long cacheId;
    private String cacheKey;
    private String cacheType;
    private String dimension;
    private LocalDate startDate;
    private LocalDate endDate;
    private String cacheData;
    private LocalDateTime createTime;
    private LocalDateTime expireTime;
}
