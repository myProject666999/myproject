package com.exercise.diary.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@TableName("exercise_type")
public class ExerciseType {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String category;

    private BigDecimal met;

    private String icon;

    private String description;

    private Integer sort;

}
