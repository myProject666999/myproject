package com.exercise.diary.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("exercise_record")
public class ExerciseRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long exerciseTypeId;

    private Integer duration;

    private Integer intensity;

    private BigDecimal calories;

    private BigDecimal distance;

    private String remark;

    private LocalDate exerciseDate;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableField(exist = false)
    private String exerciseTypeName;

    @TableField(exist = false)
    private String category;

    @TableField(exist = false)
    private BigDecimal met;

    @TableField(exist = false)
    private String icon;

}
