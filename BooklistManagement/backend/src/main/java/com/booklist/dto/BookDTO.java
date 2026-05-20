package com.booklist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BookDTO {

    private Long id;

    @Size(max = 20, message = "ISBN长度不能超过20个字符")
    private String isbn;

    @NotBlank(message = "书名不能为空")
    @Size(max = 255, message = "书名长度不能超过255个字符")
    private String title;

    @Size(max = 255, message = "副标题长度不能超过255个字符")
    private String subtitle;

    @Size(max = 255, message = "作者长度不能超过255个字符")
    private String author;

    @Size(max = 255, message = "译者长度不能超过255个字符")
    private String translator;

    @Size(max = 255, message = "出版社长度不能超过255个字符")
    private String publisher;

    private LocalDate publishDate;

    private Integer pages;

    private BigDecimal price;

    @Size(max = 10, message = "货币长度不能超过10个字符")
    private String currency;

    @Size(max = 50, message = "装帧长度不能超过50个字符")
    private String binding;

    private String summary;

    @Size(max = 500, message = "封面图片URL长度不能超过500个字符")
    private String coverUrl;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
