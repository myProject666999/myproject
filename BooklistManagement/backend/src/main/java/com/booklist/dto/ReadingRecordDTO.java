package com.booklist.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ReadingRecordDTO {

    private Long id;

    @NotNull(message = "书单ID不能为空")
    private Long bookListId;

    @NotNull(message = "阅读日期不能为空")
    private LocalDate readDate;

    @NotNull(message = "阅读时长不能为空")
    private Integer durationMinutes;

    private Integer pagesRead;

    private String note;

    private LocalDateTime createdAt;
}
