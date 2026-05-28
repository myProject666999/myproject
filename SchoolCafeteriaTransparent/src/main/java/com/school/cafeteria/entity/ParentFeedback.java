package com.school.cafeteria.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "parent_feedback")
public class ParentFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "parent_name", nullable = false, length = 50)
    private String parentName;

    @Column(length = 20)
    private String phone;

    @Column(name = "class_name", length = 50)
    private String className;

    @Column(name = "student_name", length = 50)
    private String studentName;

    @Column(name = "feedback_type", nullable = false, length = 50)
    private String feedbackType;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String images;

    @Column(length = 20)
    private String status = "PENDING";

    @Column(name = "reply_content", columnDefinition = "TEXT")
    private String replyContent;

    @Column(name = "reply_time")
    private LocalDateTime replyTime;

    @Column(name = "reply_person", length = 50)
    private String replyPerson;

    @Column(name = "is_public")
    private Integer isPublic = 0;

    @CreationTimestamp
    @Column(name = "create_time")
    private LocalDateTime createTime;

    @UpdateTimestamp
    @Column(name = "update_time")
    private LocalDateTime updateTime;
}
