package com.paper.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NoteDTO {
    private Long id;
    private Long paperId;
    private String paperTitle;
    private String title;
    private String content;
    private Integer pageNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
