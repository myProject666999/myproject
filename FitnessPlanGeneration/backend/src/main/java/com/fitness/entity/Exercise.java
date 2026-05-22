package com.fitness.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("exercise")
public class Exercise {
    private Long id;
    private String name;
    private String category;
    private String muscleGroup;
    private Integer difficulty;
    private String equipment;
    private String description;
    private Integer targetRepsMin;
    private Integer targetRepsMax;
    private Integer targetSets;
    private Integer restSeconds;
    private BigDecimal caloriesPerSet;
    private String suitableForGoal;
    private String videoUrl;
    private String imageUrl;
    private LocalDateTime createdAt;
}
