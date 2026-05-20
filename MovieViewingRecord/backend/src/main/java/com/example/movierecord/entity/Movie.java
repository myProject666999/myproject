package com.example.movierecord.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "movie", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"title", "year", "type"})
})
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "original_title", length = 255)
    private String originalTitle;

    @Column(nullable = false, length = 20)
    private String type;

    private Integer year;

    @Column(length = 500)
    private String poster;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 255)
    private String director;

    @Column(length = 500)
    private String actors;

    @Column(length = 255)
    private String genre;

    private Integer duration;

    @Column(name = "imdb_id", length = 50, unique = true)
    private String imdbId;

    @Column(name = "douban_id", length = 50, unique = true)
    private String doubanId;

    @CreationTimestamp
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
