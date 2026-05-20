package com.gamelibrary.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("play_session")
public class PlaySession {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userGameId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer duration;

    private String notes;

    private LocalDateTime createdAt;
}
