package com.paper.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class PaperRequest {
    @NotBlank(message = "标题不能为空")
    private String title;
    private String authors;
    private String abstractText;
    private String keywords;
    private Integer publicationYear;
    private String journal;
    private String volume;
    private String issue;
    private String pages;
    private String doi;
    private List<Long> tagIds;
}
