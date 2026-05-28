package com.school.cafeteria.repository;

import com.school.cafeteria.entity.AccompanyMeal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AccompanyMealRepository extends JpaRepository<AccompanyMeal, Long> {

    List<AccompanyMeal> findByMealDateOrderByCreateTime(LocalDate mealDate);

    List<AccompanyMeal> findByAccompanyType(String accompanyType);

    @Query("SELECT a FROM AccompanyMeal a WHERE a.mealDate BETWEEN :startDate AND :endDate ORDER BY a.mealDate DESC")
    List<AccompanyMeal> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    List<AccompanyMeal> findByUserId(Long userId);
}
