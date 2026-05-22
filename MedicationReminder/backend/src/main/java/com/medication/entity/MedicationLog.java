package com.medication.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("medication_log")
public class MedicationLog {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long scheduleId;

    private Long userId;

    private Long medicineId;

    private LocalDateTime plannedTime;

    private LocalDateTime actualTime;

    private Integer status;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
