package com.paper.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NoteRequest {
    @NotNull(message = "论文ID不能为空")
    private Long paperId;
    private String title;
    @NotBlank(message = "笔记内容不能为空")
    private String content;
    private Integer pageNumber;
}
