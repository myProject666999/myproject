package com.fmr.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@TableName("allergy")
public class Allergy {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long memberId;
    private String allergen;
    private Integer severity;
    private String symptom;
    private LocalDate firstOccurAt;
    private String remark;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
