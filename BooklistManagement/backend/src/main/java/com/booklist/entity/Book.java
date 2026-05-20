package com.booklist.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "book")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 255)
    private String author;

    @Column(length = 13)
    private String isbn;

    @Column(length = 255)
    private String publisher;

    @Column(name = "publish_date")
    private String publishDate;

    @Column(name = "page_count")
    private Integer pageCount;

    @Column(length = 1000)
    private String description;

    @Column(name = "cover_image", length = 500)
    private String coverImage;

    @Column(name = "category", length = 100)
    private String category;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
