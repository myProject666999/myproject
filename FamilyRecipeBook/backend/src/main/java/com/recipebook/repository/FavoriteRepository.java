package com.recipebook.repository;

import com.recipebook.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Optional<Favorite> findByRecipeId(Long recipeId);

    boolean existsByRecipeId(Long recipeId);

    void deleteByRecipeId(Long recipeId);

    @Query("SELECT f.recipeId FROM Favorite f")
    List<Long> findAllRecipeIds();

    @Query("SELECT r FROM Recipe r JOIN Favorite f ON r.id = f.recipeId ORDER BY f.createdAt DESC")
    List<com.recipebook.entity.Recipe> findFavoriteRecipes();
}
