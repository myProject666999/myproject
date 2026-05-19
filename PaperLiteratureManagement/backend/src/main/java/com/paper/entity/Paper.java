package com.paper.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "papers")
public class Paper {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(length = 1000)
    private String authors;

    @Column(name = "abstract_text", columnDefinition = "TEXT")
    private String abstractText;

    @Column(length = 500)
    private String keywords;

    @Column(name = "publication_year")
    private Integer publicationYear;

    @Column(length = 200)
    private String journal;

    @Column(length = 50)
    private String volume;

    @Column(length = 50)
    private String issue;

    @Column(length = 50)
    private String pages;

    @Column(length = 200)
    private String doi;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(name = "file_name", length = 200)
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "paper_tags",
        joinColumns = @JoinColumn(name = "paper_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private List<Tag> tags = new ArrayList<>();

    @OneToMany(mappedBy = "paper", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Note> notes = new ArrayList<>();
}
