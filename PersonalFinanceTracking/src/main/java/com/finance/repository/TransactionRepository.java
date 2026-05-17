package com.finance.repository;

import com.finance.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findAllByOrderByTransactionDateDescCreatedAtDesc();

    List<Transaction> findByTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(LocalDate startDate, LocalDate endDate);

    List<Transaction> findByTypeAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(String type, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = :type AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByTypeAndDateRange(@Param("type") String type, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT t.categoryId, c.name, c.icon, COALESCE(SUM(t.amount), 0) as total " +
           "FROM Transaction t JOIN Category c ON t.categoryId = c.id " +
           "WHERE t.type = :type AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY t.categoryId, c.name, c.icon " +
           "ORDER BY total DESC")
    List<Object[]> sumByCategoryAndDateRange(@Param("type") String type, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT FUNCTION('DATE_FORMAT', t.transactionDate, '%Y-%m'), COALESCE(SUM(t.amount), 0) " +
           "FROM Transaction t WHERE t.type = :type " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY FUNCTION('DATE_FORMAT', t.transactionDate, '%Y-%m') " +
           "ORDER BY FUNCTION('DATE_FORMAT', t.transactionDate, '%Y-%m')")
    List<Object[]> sumByMonthAndType(@Param("type") String type, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT t.accountId, a.name, COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0) " +
           "FROM Transaction t JOIN Account a ON t.accountId = a.id " +
           "WHERE t.transactionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY t.accountId, a.name")
    List<Object[]> sumByAccountAndDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
