package com.family.shoppinglist.repository;

import com.family.shoppinglist.entity.PurchaseRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PurchaseRecordRepository extends JpaRepository<PurchaseRecord, Long> {

    List<PurchaseRecord> findByPurchaseDateBetweenOrderByPurchaseDateDesc(LocalDate start, LocalDate end);

    @Query("SELECT SUM(p.price) FROM PurchaseRecord p WHERE p.purchaseDate BETWEEN :start AND :end")
    BigDecimal findTotalAmountByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT c.name, SUM(p.price) FROM PurchaseRecord p JOIN p.category c WHERE p.purchaseDate BETWEEN :start AND :end GROUP BY c.id, c.name")
    List<Object[]> findCategorySummaryByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
