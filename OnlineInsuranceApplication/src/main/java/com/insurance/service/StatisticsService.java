package com.insurance.service;

import com.insurance.repository.ClaimRepository;
import com.insurance.repository.InsurancePolicyRepository;
import com.insurance.repository.PaymentRecordRepository;
import com.insurance.repository.ReminderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StatisticsService {
    @Autowired
    private InsurancePolicyRepository policyRepository;

    @Autowired
    private PaymentRecordRepository paymentRepository;

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private ReminderRepository reminderRepository;

    public Map<String, Object> getOverviewStatistics() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalPolicies", policyRepository.count());
        stats.put("activePolicies", policyRepository.countByStatus("ACTIVE"));
        stats.put("expiredPolicies", policyRepository.countByStatus("EXPIRED"));

        BigDecimal totalSumInsured = policyRepository.getTotalSumInsured();
        stats.put("totalSumInsured", totalSumInsured != null ? totalSumInsured : BigDecimal.ZERO);

        stats.put("totalPayments", paymentRepository.count());
        stats.put("pendingPayments", paymentRepository.findByStatus("PENDING").size());
        stats.put("paidPayments", paymentRepository.findByStatus("PAID").size());

        BigDecimal totalPaidAmount = paymentRepository.getTotalAmountByStatus("PAID");
        stats.put("totalPaidAmount", totalPaidAmount != null ? totalPaidAmount : BigDecimal.ZERO);

        BigDecimal totalPendingAmount = paymentRepository.getTotalAmountByStatus("PENDING");
        stats.put("totalPendingAmount", totalPendingAmount != null ? totalPendingAmount : BigDecimal.ZERO);

        stats.put("totalClaims", claimRepository.count());
        stats.put("pendingClaims", claimRepository.countByStatus("PENDING"));
        stats.put("approvedClaims", claimRepository.countByStatus("APPROVED"));
        stats.put("rejectedClaims", claimRepository.countByStatus("REJECTED"));
        stats.put("settledClaims", claimRepository.countByStatus("SETTLED"));

        BigDecimal totalClaimAmount = claimRepository.getTotalClaimAmountByStatus("SETTLED");
        stats.put("totalClaimAmount", totalClaimAmount != null ? totalClaimAmount : BigDecimal.ZERO);

        BigDecimal totalApprovedAmount = claimRepository.getTotalApprovedAmount();
        stats.put("totalApprovedAmount", totalApprovedAmount != null ? totalApprovedAmount : BigDecimal.ZERO);

        stats.put("pendingReminders", reminderRepository.countByStatus("PENDING"));
        stats.put("sentReminders", reminderRepository.countByStatus("SENT"));

        return stats;
    }

    public List<Map<String, Object>> getStatisticsByType() {
        List<Object[]> results = policyRepository.getStatisticsByType();
        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("insuranceType", row[0]);
            map.put("policyCount", row[1]);
            map.put("totalPremium", row[2] != null ? row[2] : BigDecimal.ZERO);
            return map;
        }).collect(Collectors.toList());
    }
}
