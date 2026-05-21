package com.recipebook.controller;

import com.recipebook.dto.RecipeDTO;
import com.recipebook.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping
    public ResponseEntity<List<RecipeDTO>> getAllRecipes() {
        return ResponseEntity.ok(recipeService.getAllRecipes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipeDTO> getRecipeById(@PathVariable Long id) {
        return ResponseEntity.ok(recipeService.getRecipeById(id));
    }

    @PostMapping
    public ResponseEntity<RecipeDTO> createRecipe(@RequestBody RecipeDTO dto) {
        RecipeDTO created = recipeService.createRecipe(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecipeDTO> updateRecipe(@PathVariable Long id, @RequestBody RecipeDTO dto) {
        return ResponseEntity.ok(recipeService.updateRecipe(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id) {
        recipeService.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search/by-ingredients")
    public ResponseEntity<List<RecipeDTO>> searchByIngredients(
            @RequestParam List<String> ingredients,
            @RequestParam(defaultValue = "false") boolean exactMatch) {
        return ResponseEntity.ok(recipeService.searchByIngredients(ingredients, exactMatch));
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<RecipeDTO>> getFavorites() {
        return ResponseEntity.ok(recipeService.getFavorites());
    }
}
