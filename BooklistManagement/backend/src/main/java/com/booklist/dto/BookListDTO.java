package com.booklist.dto;

import com.booklist.entity.BookListStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class BookListDTO {

    private Long id;

    private BookDTO book;

    private BookListStatus status;

    private Integer rating;

    private String review;

    private LocalDate startDate;

    private LocalDate endDate;

    private List<TagDTO> tags;

    private Integer totalReadingMinutes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
