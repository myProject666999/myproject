package com.recipebook.dto;

import lombok.Data;

import java.util.List;

@Data
public class RecipeDTO {

    private Long id;

    private String name;

    private String description;

    private String coverImage;

    private Integer cookingTime;

    private String difficulty;

    private Integer servings;

    private List<IngredientInfo> ingredients;

    private List<StepInfo> steps;

    private List<String> seasonNames;

    private Boolean isFavorite;

    @Data
    public static class IngredientInfo {
        private Long ingredientId;
        private String ingredientName;
        private String category;
        private Double quantity;
        private String unit;
        private Boolean isRequired;
    }

    @Data
    public static class StepInfo {
        private Integer stepNumber;
        private String description;
        private String imageUrl;
    }
}
