package com.mindmap.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.FastjsonTypeHandler;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName(value = "mindmap", autoResultMap = true)
public class MindMap {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String title;
    private String description;

    private String mindmapData;

    private String theme;

    @TableLogic
    private Integer isDeleted;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
