package com.fitness.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("adjustment_suggestion")
public class AdjustmentSuggestion {
    private Long id;
    private Long userId;
    private Long weeklyPlanId;
    private Long dailyPlanId;
    private String suggestionType;
    private String suggestionContent;
    private String reason;
    private Integer isApplied;
    private LocalDateTime createdAt;
}
