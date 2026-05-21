package com.recipebook.controller;

import com.recipebook.entity.Ingredient;
import com.recipebook.service.IngredientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ingredients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IngredientController {

    private final IngredientService ingredientService;

    @GetMapping
    public ResponseEntity<List<Ingredient>> getAllIngredients() {
        return ResponseEntity.ok(ingredientService.getAllIngredients());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        return ResponseEntity.ok(ingredientService.getAllCategories());
    }

    @GetMapping("/by-category/{category}")
    public ResponseEntity<List<Ingredient>> getIngredientsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(ingredientService.getIngredientsByCategory(category));
    }

    @PostMapping
    public ResponseEntity<Ingredient> createIngredient(@RequestBody Ingredient ingredient) {
        Ingredient created = ingredientService.createIngredient(ingredient);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}
