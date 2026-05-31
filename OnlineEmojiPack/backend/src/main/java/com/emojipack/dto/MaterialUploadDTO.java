package com.emojipack.dto;

import lombok.Data;

import java.util.List;

@Data
public class MaterialUploadDTO {

    private String title;

    private String description;

    private Long categoryId;

    private Integer isCopyright;

    private Integer downloadLimit;

    private List<String> tagNames;
}
