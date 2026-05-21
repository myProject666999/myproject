package com.recipebook.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "season")
public class Season {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20, unique = true)
    private String name;
}
