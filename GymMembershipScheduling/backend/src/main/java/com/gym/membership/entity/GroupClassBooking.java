package com.gym.membership.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("group_class_booking")
public class GroupClassBooking {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long scheduleId;
    private Integer status;
    private LocalDateTime bookingTime;
    private LocalDateTime checkInTime;
}
