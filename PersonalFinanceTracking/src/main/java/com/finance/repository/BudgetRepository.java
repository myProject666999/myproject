package com.finance.repository;

import com.finance.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByYearAndMonthOrderByIdAsc(Integer year, Integer month);

    Optional<Budget> findByCategoryIdAndYearAndMonth(Long categoryId, Integer year, Integer month);

    @Query("SELECT b FROM Budget b JOIN Category c ON b.categoryId = c.id " +
           "WHERE b.year = :year AND b.month = :month AND c.type = 'expense' " +
           "ORDER BY b.budgetAmount DESC")
    List<Budget> findExpenseBudgetsByYearAndMonth(@Param("year") Integer year, @Param("month") Integer month);
}
