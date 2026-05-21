package com.recipebook.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "recipe")
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "cover_image")
    private String coverImage;

    @Column(name = "cooking_time")
    private Integer cookingTime;

    @Column(length = 20)
    private String difficulty;

    private Integer servings;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<RecipeIngredient> ingredients = new ArrayList<>();

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stepNumber ASC")
    @JsonManagedReference
    private List<RecipeStep> steps = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "recipe_season",
        joinColumns = @JoinColumn(name = "recipe_id"),
        inverseJoinColumns = @JoinColumn(name = "season_id")
    )
    private List<Season> seasons = new ArrayList<>();

    @Transient
    private Boolean isFavorite;

    public void addIngredient(RecipeIngredient ingredient) {
        ingredients.add(ingredient);
        ingredient.setRecipe(this);
    }

    public void addStep(RecipeStep step) {
        steps.add(step);
        step.setRecipe(this);
    }
}
