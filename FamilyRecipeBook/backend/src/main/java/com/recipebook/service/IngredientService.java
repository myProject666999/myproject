package com.recipebook.service;

import com.recipebook.entity.Ingredient;
import com.recipebook.repository.IngredientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IngredientService {

    private final IngredientRepository ingredientRepository;

    @Transactional(readOnly = true)
    public List<Ingredient> getAllIngredients() {
        return ingredientRepository.findAllByOrderByNameAsc();
    }

    @Transactional(readOnly = true)
    public List<Ingredient> getIngredientsByCategory(String category) {
        return ingredientRepository.findByCategory(category);
    }

    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        return ingredientRepository.findAllCategories();
    }

    @Transactional
    public Ingredient createIngredient(Ingredient ingredient) {
        return ingredientRepository.findByName(ingredient.getName())
                .orElseGet(() -> ingredientRepository.save(ingredient));
    }
}
