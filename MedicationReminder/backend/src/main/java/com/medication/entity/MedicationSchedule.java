package com.medication.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("medication_schedule")
public class MedicationSchedule {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long medicineId;

    private String dosage;

    private String frequencyType;

    private String weekDays;

    private String timeSlots;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer status;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
