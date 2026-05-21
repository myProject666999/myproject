package com.recipebook.repository;

import com.recipebook.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long>, JpaSpecificationExecutor<Recipe> {

    @Query("SELECT DISTINCT r FROM Recipe r " +
           "JOIN r.ingredients ri " +
           "JOIN ri.ingredient i " +
           "WHERE i.name IN :ingredientNames " +
           "GROUP BY r.id " +
           "HAVING COUNT(DISTINCT i.name) = :ingredientCount " +
           "ORDER BY r.createdAt DESC")
    List<Recipe> findByIngredientNamesAllMatch(@Param("ingredientNames") List<String> ingredientNames,
                                                @Param("ingredientCount") long ingredientCount);

    @Query("SELECT DISTINCT r FROM Recipe r " +
           "JOIN r.ingredients ri " +
           "JOIN ri.ingredient i " +
           "WHERE i.name IN :ingredientNames " +
           "GROUP BY r.id " +
           "ORDER BY COUNT(DISTINCT i.name) DESC, r.createdAt DESC")
    List<Recipe> findByIngredientNamesPartialMatch(@Param("ingredientNames") List<String> ingredientNames);

    List<Recipe> findByDifficulty(String difficulty);

    @Query("SELECT r FROM Recipe r JOIN r.seasons s WHERE s.name = :seasonName ORDER BY r.createdAt DESC")
    List<Recipe> findBySeasonName(@Param("seasonName") String seasonName);

    List<Recipe> findAllByOrderByCreatedAtDesc();
}
