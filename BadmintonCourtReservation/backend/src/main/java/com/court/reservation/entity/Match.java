package com.court.reservation.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("match_info")
public class Match {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long initiatorId;
    private Long courtId;
    private LocalDate date;
    private String timeSlot;
    private String sportType;
    private Integer maxPlayers;
    private Integer currentPlayers;
    private String description;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}