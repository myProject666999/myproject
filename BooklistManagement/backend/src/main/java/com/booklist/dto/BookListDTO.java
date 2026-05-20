package com.booklist.dto;

import com.booklist.entity.BookList.Status;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookListDTO {

    private Long id;

    @NotNull(message = "用户ID不能为空")
    private Long userId;

    @NotNull(message = "书籍ID不能为空")
    private Long bookId;

    @NotNull(message = "状态不能为空")
    private Status status;

    private Integer rating;

    private String review;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private BookDTO book;
}
