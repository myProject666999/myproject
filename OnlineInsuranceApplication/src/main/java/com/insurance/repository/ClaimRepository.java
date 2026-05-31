package com.insurance.repository;

import com.insurance.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByPolicyId(Long policyId);

    List<Claim> findByStatus(String status);

    @Query("SELECT c FROM Claim c WHERE c.policy.id = :policyId ORDER BY c.claimDate DESC")
    List<Claim> findByPolicyIdOrderByClaimDateDesc(@Param("policyId") Long policyId);

    @Query("SELECT COUNT(c) FROM Claim c WHERE c.status = :status")
    long countByStatus(@Param("status") String status);

    @Query("SELECT SUM(c.claimAmount) FROM Claim c WHERE c.status = :status")
    java.math.BigDecimal getTotalClaimAmountByStatus(@Param("status") String status);

    @Query("SELECT SUM(c.approvedAmount) FROM Claim c WHERE c.status = 'SETTLED'")
    java.math.BigDecimal getTotalApprovedAmount();
}
