package com.insurance.repository;

import com.insurance.entity.InsurancePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InsurancePolicyRepository extends JpaRepository<InsurancePolicy, Long> {
    List<InsurancePolicy> findByStatus(String status);

    List<InsurancePolicy> findByInsuranceType(String insuranceType);

    @Query("SELECT p FROM InsurancePolicy p WHERE p.expiryDate BETWEEN :startDate AND :endDate")
    List<InsurancePolicy> findPoliciesExpiringBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT p FROM InsurancePolicy p WHERE p.effectiveDate <= :today AND p.expiryDate >= :today")
    List<InsurancePolicy> findActivePolicies(@Param("today") LocalDate today);

    @Query("SELECT COUNT(p) FROM InsurancePolicy p WHERE p.status = :status")
    long countByStatus(@Param("status") String status);

    @Query("SELECT SUM(p.sumInsured) FROM InsurancePolicy p")
    java.math.BigDecimal getTotalSumInsured();

    @Query("SELECT p.insuranceType, COUNT(p), SUM(p.premium) FROM InsurancePolicy p GROUP BY p.insuranceType")
    List<Object[]> getStatisticsByType();
}
