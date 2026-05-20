package com.gamelibrary.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("game")
public class Game {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Integer steamAppId;

    private String name;

    private String coverImage;

    private String description;

    private String genre;

    private String developer;

    private String publisher;

    private LocalDate releaseDate;

    private BigDecimal price;

    private String platform;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
