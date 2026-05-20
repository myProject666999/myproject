package com.booklist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BookDTO {

    private Long id;

    @NotBlank(message = "书名不能为空")
    @Size(max = 255, message = "书名长度不能超过255个字符")
    private String title;

    @Size(max = 255, message = "作者长度不能超过255个字符")
    private String author;

    @Size(max = 13, message = "ISBN长度不能超过13个字符")
    private String isbn;

    @Size(max = 255, message = "出版社长度不能超过255个字符")
    private String publisher;

    private String publishDate;

    private Integer pageCount;

    @Size(max = 1000, message = "简介长度不能超过1000个字符")
    private String description;

    @Size(max = 500, message = "封面图片URL长度不能超过500个字符")
    private String coverImage;

    @Size(max = 100, message = "分类长度不能超过100个字符")
    private String category;
}
