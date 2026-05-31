package com.emojipack.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CollectionCreateDTO {

    @NotBlank(message = "合集标题不能为空")
    private String title;

    private String description;

    private String coverUrl;

    private Integer isPublic;
}
