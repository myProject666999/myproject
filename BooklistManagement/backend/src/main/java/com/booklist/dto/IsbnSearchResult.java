package com.booklist.dto;

import lombok.Data;

@Data
public class IsbnSearchResult {

    private String isbn;

    private String title;

    private String author;

    private String publisher;

    private String publishDate;

    private Integer pageCount;

    private String description;

    private String coverImage;

    private String category;
}
