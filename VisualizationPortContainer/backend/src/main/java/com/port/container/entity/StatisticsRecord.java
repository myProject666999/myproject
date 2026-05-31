package com.port.container.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("statistics_record")
public class StatisticsRecord implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String statisticsNo;

    private String statisticsType;

    private LocalDate statisticsDate;

    private Long yardId;

    private String yardCode;

    private Integer totalSlots;

    private Integer occupiedSlots;

    private Integer availableSlots;

    private BigDecimal occupancyRate;

    private Integer inCount;

    private Integer outCount;

    private Integer moveCount;

    private Integer taskCount;

    private Integer completedTaskCount;

    private BigDecimal taskCompletionRate;

    private Integer craneCount;

    private Integer workingCraneCount;

    private Integer idleCraneCount;

    private BigDecimal craneUtilizationRate;

    private BigDecimal totalHandlingWeight;

    private Integer totalOperationTime;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
