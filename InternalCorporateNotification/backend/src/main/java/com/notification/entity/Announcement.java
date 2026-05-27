package com.notification.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("announcement")
public class Announcement {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String content;

    private Long categoryId;

    private Integer type;

    private Integer priority;

    private Integer status;

    private Long publisherId;

    private String publisherName;

    private Long departmentId;

    private String targetDepartments;

    private Integer isAllDepartments;

    private Integer readCount;

    private Integer totalCount;

    private LocalDateTime publishTime;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableField(exist = false)
    private String categoryName;

    @TableField(exist = false)
    private String departmentName;

    @TableField(exist = false)
    private Integer isRead;
}
