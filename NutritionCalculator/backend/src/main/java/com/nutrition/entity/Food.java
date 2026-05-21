package com.nutrition.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("food")
public class Food {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String category;

    private Integer calories;

    private Integer protein;

    private Integer fat;

    private Integer carbs;

    private Integer unitGram;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
