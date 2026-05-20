package com.gamelibrary.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("user_game")
public class UserGame {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long gameId;

    private Integer totalPlayTime;

    private LocalDateTime lastPlayedAt;

    private Integer completionStatus;

    private Integer completionPercentage;

    private LocalDate purchaseDate;

    private Integer isFavorite;

    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
