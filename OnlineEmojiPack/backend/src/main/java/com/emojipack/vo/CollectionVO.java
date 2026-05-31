package com.emojipack.vo;

import lombok.Data;

import java.util.List;

@Data
public class CollectionVO {

    private Long id;
    private String title;
    private String coverUrl;
    private String description;
    private Long userId;
    private String userName;
    private Integer materialCount;
    private Integer favoriteCount;
    private Integer viewCount;
    private Integer isPublic;
    private String createTime;
    private List<MaterialVO> materials;
}
