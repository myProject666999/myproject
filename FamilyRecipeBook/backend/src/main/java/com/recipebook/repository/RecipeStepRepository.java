package com.recipebook.repository;

import com.recipebook.entity.RecipeStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeStepRepository extends JpaRepository<RecipeStep, Long> {

    List<RecipeStep> findByRecipeIdOrderByStepNumberAsc(Long recipeId);

    void deleteByRecipeId(Long recipeId);
}
