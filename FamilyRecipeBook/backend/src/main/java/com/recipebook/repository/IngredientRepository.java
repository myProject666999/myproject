package com.recipebook.repository;

import com.recipebook.entity.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    Optional<Ingredient> findByName(String name);

    List<Ingredient> findByNameIn(List<String> names);

    List<Ingredient> findAllByOrderByNameAsc();

    List<Ingredient> findByCategory(String category);

    @Query("SELECT DISTINCT i.category FROM Ingredient i WHERE i.category IS NOT NULL ORDER BY i.category")
    List<String> findAllCategories();
}
