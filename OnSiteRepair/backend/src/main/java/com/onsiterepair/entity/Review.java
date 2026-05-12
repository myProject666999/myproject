package com.onsiterepair.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("review")
public class Review {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long orderId;
    private Long userId;
    private Long workerId;
    private Integer rating;
    private String content;
    private String images;
    private Integer status;
    private String replyContent;
    private LocalDateTime replyTime;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
