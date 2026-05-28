package com.school.cafeteria.repository;

import com.school.cafeteria.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {

    List<Menu> findByMenuDateOrderByMealType(LocalDate menuDate);

    List<Menu> findByMenuDateAndMealType(LocalDate menuDate, String mealType);

    @Query("SELECT m FROM Menu m WHERE m.menuDate BETWEEN :startDate AND :endDate ORDER BY m.menuDate, m.mealType")
    List<Menu> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
