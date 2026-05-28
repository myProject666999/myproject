package com.creator.subscription.dto;

import com.creator.subscription.enums.ContentType;
import lombok.Data;

import java.util.List;

@Data
public class ContentDTO {
    private Long creatorId;
    private String title;
    private ContentType contentType;
    private String content;
    private List<String> mediaUrls;
    private String thumbnailUrl;
    private Integer minTierLevel;
}
