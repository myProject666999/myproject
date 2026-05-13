package com.gym.membership.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@TableName("group_class_schedule")
public class GroupClassSchedule {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long courseTypeId;
    private Long coachId;
    private LocalDate classDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String classroom;
    private Integer maxParticipants;
    private Integer currentParticipants;
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableLogic
    private Integer deleted;
}
