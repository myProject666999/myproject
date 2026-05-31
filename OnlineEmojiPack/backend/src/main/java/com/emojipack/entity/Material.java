package com.emojipack.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("material")
public class Material {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String description;

    private Long categoryId;

    private Long uploaderId;

    private String fileUrl;

    private String thumbnailUrl;

    private String fileType;

    private Long fileSize;

    private Integer width;

    private Integer height;

    private Integer isCopyright;

    private Integer downloadLimit;

    private Integer downloadCount;

    private Integer favoriteCount;

    private Integer viewCount;

    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    @TableField(exist = false)
    private List<Tag> tags;

    @TableField(exist = false)
    private String categoryName;

    @TableField(exist = false)
    private String uploaderName;
}
