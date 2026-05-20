package com.booklist.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class YearlyReportDTO {

    private Integer year;

    private Integer totalBooksRead;

    private Integer totalPagesRead;

    private Double averageRating;

    private List<String> topAuthors;

    private List<String> topCategories;

    private Map<String, Integer> monthlyBooks;

    private List<BookDTO> favoriteBooks;
}
