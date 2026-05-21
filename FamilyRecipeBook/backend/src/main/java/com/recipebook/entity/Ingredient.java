package com.recipebook.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "ingredient")
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50, unique = true)
    private String name;

    @Column(length = 50)
    private String category;
}
