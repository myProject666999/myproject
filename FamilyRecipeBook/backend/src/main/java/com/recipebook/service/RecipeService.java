package com.recipebook.service;

import com.recipebook.dto.RecipeDTO;
import com.recipebook.entity.*;
import com.recipebook.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final SeasonRepository seasonRepository;
    private final FavoriteRepository favoriteRepository;

    private RecipeDTO toDTO(Recipe recipe, boolean isFavorite) {
        RecipeDTO dto = new RecipeDTO();
        dto.setId(recipe.getId());
        dto.setName(recipe.getName());
        dto.setDescription(recipe.getDescription());
        dto.setCoverImage(recipe.getCoverImage());
        dto.setCookingTime(recipe.getCookingTime());
        dto.setDifficulty(recipe.getDifficulty());
        dto.setServings(recipe.getServings());
        dto.setIsFavorite(isFavorite);

        List<RecipeDTO.IngredientInfo> ingredientInfos = new ArrayList<>();
        for (RecipeIngredient ri : recipe.getIngredients()) {
            RecipeDTO.IngredientInfo info = new RecipeDTO.IngredientInfo();
            info.setIngredientId(ri.getIngredient().getId());
            info.setIngredientName(ri.getIngredient().getName());
            info.setCategory(ri.getIngredient().getCategory());
            info.setQuantity(ri.getQuantity());
            info.setUnit(ri.getUnit());
            info.setIsRequired(ri.getIsRequired());
            ingredientInfos.add(info);
        }
        dto.setIngredients(ingredientInfos);

        List<RecipeDTO.StepInfo> stepInfos = new ArrayList<>();
        for (RecipeStep step : recipe.getSteps()) {
            RecipeDTO.StepInfo info = new RecipeDTO.StepInfo();
            info.setStepNumber(step.getStepNumber());
            info.setDescription(step.getDescription());
            info.setImageUrl(step.getImageUrl());
            stepInfos.add(info);
        }
        dto.setSteps(stepInfos);

        List<String> seasonNames = recipe.getSeasons().stream()
                .map(Season::getName)
                .collect(Collectors.toList());
        dto.setSeasonNames(seasonNames);

        return dto;
    }

    private Recipe toEntity(RecipeDTO dto) {
        Recipe recipe = new Recipe();
        recipe.setName(dto.getName());
        recipe.setDescription(dto.getDescription());
        recipe.setCoverImage(dto.getCoverImage());
        recipe.setCookingTime(dto.getCookingTime());
        recipe.setDifficulty(dto.getDifficulty());
        recipe.setServings(dto.getServings());
        return recipe;
    }

    @Transactional(readOnly = true)
    public List<RecipeDTO> getAllRecipes() {
        List<Long> favoriteIds = favoriteRepository.findAllRecipeIds();
        return recipeRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(r -> toDTO(r, favoriteIds.contains(r.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RecipeDTO getRecipeById(Long id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found: " + id));
        boolean isFav = favoriteRepository.existsByRecipeId(id);
        return toDTO(recipe, isFav);
    }

    @Transactional
    public RecipeDTO createRecipe(RecipeDTO dto) {
        Recipe recipe = toEntity(dto);

        if (dto.getIngredients() != null) {
            for (RecipeDTO.IngredientInfo ii : dto.getIngredients()) {
                Ingredient ingredient = ingredientRepository.findByName(ii.getIngredientName())
                        .orElseGet(() -> {
                            Ingredient ing = new Ingredient();
                            ing.setName(ii.getIngredientName());
                            ing.setCategory(ii.getCategory());
                            return ingredientRepository.save(ing);
                        });
                RecipeIngredient ri = new RecipeIngredient();
                ri.setIngredient(ingredient);
                ri.setQuantity(ii.getQuantity());
                ri.setUnit(ii.getUnit());
                ri.setIsRequired(ii.getIsRequired() != null ? ii.getIsRequired() : true);
                recipe.addIngredient(ri);
            }
        }

        if (dto.getSteps() != null) {
            for (RecipeDTO.StepInfo si : dto.getSteps()) {
                RecipeStep step = new RecipeStep();
                step.setStepNumber(si.getStepNumber());
                step.setDescription(si.getDescription());
                step.setImageUrl(si.getImageUrl());
                recipe.addStep(step);
            }
        }

        if (dto.getSeasonNames() != null) {
            List<Season> seasons = dto.getSeasonNames().stream()
                    .map(name -> seasonRepository.findByName(name).orElse(null))
                    .filter(s -> s != null)
                    .collect(Collectors.toList());
            recipe.setSeasons(seasons);
        }

        Recipe saved = recipeRepository.save(recipe);
        return toDTO(saved, false);
    }

    @Transactional
    public RecipeDTO updateRecipe(Long id, RecipeDTO dto) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found: " + id));

        recipe.setName(dto.getName());
        recipe.setDescription(dto.getDescription());
        recipe.setCoverImage(dto.getCoverImage());
        recipe.setCookingTime(dto.getCookingTime());
        recipe.setDifficulty(dto.getDifficulty());
        recipe.setServings(dto.getServings());

        recipe.getIngredients().clear();
        if (dto.getIngredients() != null) {
            for (RecipeDTO.IngredientInfo ii : dto.getIngredients()) {
                Ingredient ingredient = ingredientRepository.findByName(ii.getIngredientName())
                        .orElseGet(() -> {
                            Ingredient ing = new Ingredient();
                            ing.setName(ii.getIngredientName());
                            ing.setCategory(ii.getCategory());
                            return ingredientRepository.save(ing);
                        });
                RecipeIngredient ri = new RecipeIngredient();
                ri.setIngredient(ingredient);
                ri.setQuantity(ii.getQuantity());
                ri.setUnit(ii.getUnit());
                ri.setIsRequired(ii.getIsRequired() != null ? ii.getIsRequired() : true);
                recipe.addIngredient(ri);
            }
        }

        recipe.getSteps().clear();
        if (dto.getSteps() != null) {
            for (RecipeDTO.StepInfo si : dto.getSteps()) {
                RecipeStep step = new RecipeStep();
                step.setStepNumber(si.getStepNumber());
                step.setDescription(si.getDescription());
                step.setImageUrl(si.getImageUrl());
                recipe.addStep(step);
            }
        }

        if (dto.getSeasonNames() != null) {
            List<Season> seasons = dto.getSeasonNames().stream()
                    .map(name -> seasonRepository.findByName(name).orElse(null))
                    .filter(s -> s != null)
                    .collect(Collectors.toList());
            recipe.setSeasons(seasons);
        }

        Recipe saved = recipeRepository.save(recipe);
        boolean isFav = favoriteRepository.existsByRecipeId(id);
        return toDTO(saved, isFav);
    }

    @Transactional
    public void deleteRecipe(Long id) {
        if (!recipeRepository.existsById(id)) {
            throw new RuntimeException("Recipe not found: " + id);
        }
        favoriteRepository.deleteByRecipeId(id);
        recipeRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<RecipeDTO> searchByIngredients(List<String> ingredientNames, boolean exactMatch) {
        List<Recipe> recipes;
        if (exactMatch) {
            recipes = recipeRepository.findByIngredientNamesAllMatch(
                    ingredientNames, (long) ingredientNames.size());
        } else {
            recipes = recipeRepository.findByIngredientNamesPartialMatch(ingredientNames);
        }
        List<Long> favoriteIds = favoriteRepository.findAllRecipeIds();
        return recipes.stream()
                .map(r -> toDTO(r, favoriteIds.contains(r.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RecipeDTO> getFavorites() {
        return favoriteRepository.findFavoriteRecipes().stream()
                .map(r -> toDTO(r, true))
                .collect(Collectors.toList());
    }
}
