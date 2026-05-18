package com.example.resume.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "resume_skill")
public class ResumeSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "resume_id", nullable = false)
    private Long resumeId;

    @Column(nullable = false, length = 100)
    private String name;

    private Integer level = 5;

    @Column(length = 50)
    private String category;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;
}
