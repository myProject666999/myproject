package com.paper.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PaperDTO {
    private Long id;
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
    private String fileName;
    private Long fileSize;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TagDTO> tags;
    private Integer noteCount;
}
