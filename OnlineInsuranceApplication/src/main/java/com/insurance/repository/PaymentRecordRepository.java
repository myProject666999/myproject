package com.insurance.repository;

import com.insurance.entity.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {
    List<PaymentRecord> findByPolicyId(Long policyId);

    List<PaymentRecord> findByStatus(String status);

    @Query("SELECT p FROM PaymentRecord p WHERE p.dueDate BETWEEN :startDate AND :endDate")
    List<PaymentRecord> findPaymentsDueBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT p FROM PaymentRecord p WHERE p.status = :status AND p.dueDate <= :dueDate")
    List<PaymentRecord> findOverduePayments(@Param("status") String status, @Param("dueDate") LocalDate dueDate);

    @Query("SELECT p FROM PaymentRecord p WHERE p.policy.id = :policyId ORDER BY p.dueDate DESC")
    List<PaymentRecord> findByPolicyIdOrderByDueDateDesc(@Param("policyId") Long policyId);

    @Query("SELECT SUM(p.amount) FROM PaymentRecord p WHERE p.status = :status")
    java.math.BigDecimal getTotalAmountByStatus(@Param("status") String status);
}
