package com.emojipack.vo;

import lombok.Data;

import java.util.List;

@Data
public class MaterialVO {

    private Long id;
    private String title;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Long uploaderId;
    private String uploaderName;
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
    private List<TagVO> tags;
    private String createTime;
}
