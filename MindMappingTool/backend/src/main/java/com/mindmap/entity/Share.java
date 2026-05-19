package com.mindmap.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("share")
public class Share {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long mindmapId;
    private String shareCode;
    private Integer viewCount;
    private LocalDateTime expireAt;
    private LocalDateTime createdAt;
}
