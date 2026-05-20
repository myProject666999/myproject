package com.flashcard.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "review_logs")
public class ReviewLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "card_id", nullable = false)
    private Long cardId;

    @Column(nullable = false)
    private Integer quality;

    @Column(name = "review_date", nullable = false)
    private LocalDateTime reviewDate;

    @Column(name = "previous_review_interval")
    private Integer previousReviewInterval;

    @Column(name = "new_review_interval")
    private Integer newReviewInterval;

    @Column(name = "previous_ease_factor")
    private Double previousEaseFactor;

    @Column(name = "new_ease_factor")
    private Double newEaseFactor;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
