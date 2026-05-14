package com.fishing.reservation.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("live_stream")
public class LiveStream {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String description;
    private String streamUrl;
    private Integer status;
    private Integer viewCount;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
