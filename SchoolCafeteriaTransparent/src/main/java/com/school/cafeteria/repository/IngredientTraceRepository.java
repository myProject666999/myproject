package com.school.cafeteria.repository;

import com.school.cafeteria.entity.IngredientTrace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface IngredientTraceRepository extends JpaRepository<IngredientTrace, Long> {

    Optional<IngredientTrace> findByBatchNo(String batchNo);

    List<IngredientTrace> findBySupplierId(Long supplierId);

    @Query("SELECT i FROM IngredientTrace i WHERE i.purchaseDate BETWEEN :startDate AND :endDate ORDER BY i.purchaseDate DESC")
    List<IngredientTrace> findByPurchaseDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    List<IngredientTrace> findByIngredientNameContaining(String ingredientName);
}
