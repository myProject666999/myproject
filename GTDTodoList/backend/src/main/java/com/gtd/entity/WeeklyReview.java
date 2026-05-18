package com.gtd.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "weekly_reviews")
public class WeeklyReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "review_date", nullable = false)
    private LocalDate reviewDate;

    @Column(name = "week_start_date", nullable = false)
    private LocalDate weekStartDate;

    @Column(name = "week_end_date", nullable = false)
    private LocalDate weekEndDate;

    @Column(name = "tasks_completed")
    private Integer tasksCompleted = 0;

    @Column(name = "tasks_created")
    private Integer tasksCreated = 0;

    @Column(name = "inbox_processed")
    private Integer inboxProcessed = 0;

    @Column(name = "projects_active")
    private Integer projectsActive = 0;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "next_week_goals", columnDefinition = "TEXT")
    private String nextWeekGoals;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
