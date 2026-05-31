package com.insurance.service;

import com.insurance.entity.Claim;
import com.insurance.entity.InsurancePolicy;
import com.insurance.repository.ClaimRepository;
import com.insurance.repository.InsurancePolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ClaimService {
    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private InsurancePolicyRepository policyRepository;

    public List<Claim> getAllClaims() {
        return claimRepository.findAll();
    }

    public List<Claim> getClaimsByPolicyId(Long policyId) {
        return claimRepository.findByPolicyIdOrderByClaimDateDesc(policyId);
    }

    public List<Claim> getClaimsByStatus(String status) {
        return claimRepository.findByStatus(status);
    }

    public Optional<Claim> getClaimById(Long id) {
        return claimRepository.findById(id);
    }

    @Transactional
    public Claim createClaim(Long policyId, Claim claim) {
        InsurancePolicy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found with id " + policyId));

        claim.setClaimNumber(generateClaimNumber());
        if (claim.getClaimDate() == null) {
            claim.setClaimDate(LocalDate.now());
        }
        if (claim.getStatus() == null) {
            claim.setStatus("PENDING");
        }
        claim.setPolicy(policy);

        return claimRepository.save(claim);
    }

    @Transactional
    public Claim updateClaimStatus(Long id, String status, java.math.BigDecimal approvedAmount, String remarks) {
        return claimRepository.findById(id)
                .map(claim -> {
                    claim.setStatus(status);
                    if (approvedAmount != null) {
                        claim.setApprovedAmount(approvedAmount);
                    }
                    if (remarks != null) {
                        claim.setRemarks(remarks);
                    }
                    if ("SETTLED".equals(status)) {
                        claim.setSettlementDate(LocalDate.now());
                    }
                    return claimRepository.save(claim);
                })
                .orElseThrow(() -> new RuntimeException("Claim not found with id " + id));
    }

    @Transactional
    public void deleteClaim(Long id) {
        claimRepository.deleteById(id);
    }

    private String generateClaimNumber() {
        return "CLM-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
