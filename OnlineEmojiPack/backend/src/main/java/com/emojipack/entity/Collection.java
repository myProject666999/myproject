package com.emojipack.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("collection")
public class Collection {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String coverUrl;

    private String description;

    private Long userId;

    private Integer materialCount;

    private Integer favoriteCount;

    private Integer viewCount;

    private Integer isPublic;

    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    @TableField(exist = false)
    private String userName;

    @TableField(exist = false)
    private List<Material> materials;
}
