package com.booklist.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class YearlyReportDTO {

    private Integer year;

    private Integer booksFinished;

    private Integer booksReading;

    private Integer booksInWishlist;

    private Integer totalReadingMinutes;

    private Double totalReadingHours;

    private Integer totalPagesRead;

    private Double averageRating;

    private Map<String, Integer> topTags;

    private Map<String, Integer> topAuthors;

    private Map<String, Integer> monthlyReadingMinutes;

    private List<BookListDTO> finishedBooks;
}
