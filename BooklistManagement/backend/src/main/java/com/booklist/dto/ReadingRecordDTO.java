package com.booklist.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReadingRecordDTO {

    private Long id;

    @NotNull(message = "用户ID不能为空")
    private Long userId;

    @NotNull(message = "书籍ID不能为空")
    private Long bookId;

    @NotNull(message = "阅读页数不能为空")
    @Positive(message = "阅读页数必须为正数")
    private Integer pagesRead;

    @NotNull(message = "记录日期不能为空")
    private LocalDateTime recordDate;

    private String notes;

    private BookDTO book;
}
