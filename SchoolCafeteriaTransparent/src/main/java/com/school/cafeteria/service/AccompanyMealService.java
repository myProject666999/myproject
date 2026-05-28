package com.school.cafeteria.service;

import com.school.cafeteria.entity.AccompanyMeal;
import com.school.cafeteria.entity.MealEvaluation;
import com.school.cafeteria.repository.AccompanyMealRepository;
import com.school.cafeteria.repository.MealEvaluationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AccompanyMealService {

    @Autowired
    private AccompanyMealRepository accompanyMealRepository;

    @Autowired
    private MealEvaluationRepository mealEvaluationRepository;

    public AccompanyMeal save(AccompanyMeal meal) {
        return accompanyMealRepository.save(meal);
    }

    public Optional<AccompanyMeal> findById(Long id) {
        Optional<AccompanyMeal> meal = accompanyMealRepository.findById(id);
        meal.ifPresent(this::loadEvaluation);
        return meal;
    }

    public List<AccompanyMeal> findByDate(LocalDate date) {
        List<AccompanyMeal> meals = accompanyMealRepository.findByMealDateOrderByCreateTime(date);
        meals.forEach(this::loadEvaluation);
        return meals;
    }

    public List<AccompanyMeal> findByDateRange(LocalDate startDate, LocalDate endDate) {
        List<AccompanyMeal> meals = accompanyMealRepository.findByDateRange(startDate, endDate);
        meals.forEach(this::loadEvaluation);
        return meals;
    }

    public List<AccompanyMeal> findByType(String accompanyType) {
        List<AccompanyMeal> meals = accompanyMealRepository.findByAccompanyType(accompanyType);
        meals.forEach(this::loadEvaluation);
        return meals;
    }

    public List<AccompanyMeal> findByUserId(Long userId) {
        return accompanyMealRepository.findByUserId(userId);
    }

    public List<AccompanyMeal> findAll() {
        return accompanyMealRepository.findAll();
    }

    @Transactional
    public MealEvaluation saveEvaluation(MealEvaluation evaluation) {
        BigDecimal taste = BigDecimal.valueOf(evaluation.getTasteScore());
        BigDecimal hygiene = BigDecimal.valueOf(evaluation.getHygieneScore());
        BigDecimal service = BigDecimal.valueOf(evaluation.getServiceScore());
        BigDecimal overall = taste.add(hygiene).add(service)
                .divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);
        evaluation.setOverallScore(overall);
        return mealEvaluationRepository.save(evaluation);
    }

    public Optional<MealEvaluation> findEvaluationByMealId(Long mealId) {
        return mealEvaluationRepository.findByAccompanyMealId(mealId);
    }

    public Map<String, Object> getEvaluationStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("avgOverallScore", mealEvaluationRepository.calculateAverageOverallScore());
        stats.put("avgTasteScore", mealEvaluationRepository.calculateAverageTasteScore());
        stats.put("avgHygieneScore", mealEvaluationRepository.calculateAverageHygieneScore());
        stats.put("avgServiceScore", mealEvaluationRepository.calculateAverageServiceScore());
        stats.put("goodCount", mealEvaluationRepository.countByOverallScoreGreaterThanEqual(BigDecimal.valueOf(4)));
        return stats;
    }

    public void delete(Long id) {
        accompanyMealRepository.deleteById(id);
    }

    private void loadEvaluation(AccompanyMeal meal) {
        Optional<MealEvaluation> evaluation = mealEvaluationRepository.findByAccompanyMealId(meal.getId());
        evaluation.ifPresent(meal::setEvaluation);
    }
}
