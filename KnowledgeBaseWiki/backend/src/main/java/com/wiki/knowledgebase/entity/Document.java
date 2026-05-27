package com.wiki.knowledgebase.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "space_id", nullable = false)
    private Long spaceId;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "content_html", columnDefinition = "TEXT")
    private String contentHtml;

    @Column(length = 500)
    private String path;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer depth = 0;

    @Column(name = "sort_order", columnDefinition = "INT DEFAULT 0")
    private Integer sortOrder = 0;

    @Column(name = "creator_id", nullable = false)
    private Long creatorId;

    @Column(name = "last_editor_id")
    private Long lastEditorId;

    @Column(columnDefinition = "INT DEFAULT 1")
    private Integer version = 1;

    @Column(name = "is_folder", columnDefinition = "TINYINT DEFAULT 0")
    private Integer isFolder = 0;

    @Column(columnDefinition = "TINYINT DEFAULT 1")
    private Integer status = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
