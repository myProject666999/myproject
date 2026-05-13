package com.court.reservation.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("coach_course")
public class CoachCourse {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long coachId;
    private Long userId;
    private Long courtId;
    private LocalDate date;
    private String timeSlot;
    private Double price;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}