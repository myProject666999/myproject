package com.giftwishlist.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("item")
public class Item {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long wishlistId;
    private String title;
    private String description;
    private String url;
    private String imageUrl;
    private BigDecimal price;
    private Integer priority;
    private Integer isClaimed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
