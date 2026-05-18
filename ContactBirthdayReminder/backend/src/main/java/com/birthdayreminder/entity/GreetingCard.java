package com.birthdayreminder.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("greeting_card")
public class GreetingCard {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String templateContent;
    private String coverImage;
    private String category;
    private Integer isDefault;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
