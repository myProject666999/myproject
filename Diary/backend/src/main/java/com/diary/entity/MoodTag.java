package com.diary.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("mood_tag")
public class MoodTag {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String category;
    private Integer weight;
}
