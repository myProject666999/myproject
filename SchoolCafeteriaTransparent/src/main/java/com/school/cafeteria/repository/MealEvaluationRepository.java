package com.school.cafeteria.repository;

import com.school.cafeteria.entity.MealEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface MealEvaluationRepository extends JpaRepository<MealEvaluation, Long> {

    Optional<MealEvaluation> findByAccompanyMealId(Long accompanyMealId);

    @Query("SELECT AVG(m.overallScore) FROM MealEvaluation m")
    BigDecimal calculateAverageOverallScore();

    @Query("SELECT AVG(m.tasteScore) FROM MealEvaluation m")
    BigDecimal calculateAverageTasteScore();

    @Query("SELECT AVG(m.hygieneScore) FROM MealEvaluation m")
    BigDecimal calculateAverageHygieneScore();

    @Query("SELECT AVG(m.serviceScore) FROM MealEvaluation m")
    BigDecimal calculateAverageServiceScore();

    @Query("SELECT COUNT(m) FROM MealEvaluation m WHERE m.overallScore >= :score")
    Long countByOverallScoreGreaterThanEqual(@Param("score") BigDecimal score);
}
