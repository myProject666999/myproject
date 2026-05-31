package com.insurance.service;

import com.insurance.entity.*;
import com.insurance.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class InsurancePolicyService {
    @Autowired
    private InsurancePolicyRepository policyRepository;

    @Autowired
    private PaymentRecordRepository paymentRepository;

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private PaymentScheduleService paymentScheduleService;

    @Transactional
    public InsurancePolicy createPolicy(InsurancePolicy policy) {
        policy.setPolicyNumber(generatePolicyNumber());
        if (policy.getStatus() == null) {
            policy.setStatus("ACTIVE");
        }
        if (policy.getInsuredPerson() != null) {
            policy.getInsuredPerson().setPolicy(policy);
        }
        if (policy.getBeneficiaries() != null) {
            for (Beneficiary beneficiary : policy.getBeneficiaries()) {
                beneficiary.setPolicy(policy);
            }
        }
        InsurancePolicy savedPolicy = policyRepository.save(policy);
        paymentScheduleService.generatePaymentSchedule(savedPolicy);
        createExpiryReminder(savedPolicy);
        return savedPolicy;
    }

    public Optional<InsurancePolicy> getPolicyById(Long id) {
        return policyRepository.findById(id);
    }

    public List<InsurancePolicy> getAllPolicies() {
        return policyRepository.findAll();
    }

    public List<InsurancePolicy> getPoliciesByStatus(String status) {
        return policyRepository.findByStatus(status);
    }

    public List<InsurancePolicy> getPoliciesByType(String insuranceType) {
        return policyRepository.findByInsuranceType(insuranceType);
    }

    public List<InsurancePolicy> getActivePolicies() {
        return policyRepository.findActivePolicies(LocalDate.now());
    }

    public List<InsurancePolicy> getPoliciesExpiringSoon(int days) {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(days);
        return policyRepository.findPoliciesExpiringBetween(startDate, endDate);
    }

    @Transactional
    public InsurancePolicy updatePolicy(Long id, InsurancePolicy policyDetails) {
        return policyRepository.findById(id)
                .map(policy -> {
                    policy.setInsuranceType(policyDetails.getInsuranceType());
                    policy.setSumInsured(policyDetails.getSumInsured());
                    policy.setPremium(policyDetails.getPremium());
                    policy.setPaymentCycle(policyDetails.getPaymentCycle());
                    policy.setEffectiveDate(policyDetails.getEffectiveDate());
                    policy.setExpiryDate(policyDetails.getExpiryDate());
                    policy.setInsuranceCompany(policyDetails.getInsuranceCompany());
                    policy.setRemarks(policyDetails.getRemarks());
                    policy.setStatus(policyDetails.getStatus());

                    if (policyDetails.getInsuredPerson() != null) {
                        policy.getInsuredPerson().setName(policyDetails.getInsuredPerson().getName());
                        policy.getInsuredPerson().setIdCard(policyDetails.getInsuredPerson().getIdCard());
                        policy.getInsuredPerson().setBirthDate(policyDetails.getInsuredPerson().getBirthDate());
                        policy.getInsuredPerson().setGender(policyDetails.getInsuredPerson().getGender());
                        policy.getInsuredPerson().setPhone(policyDetails.getInsuredPerson().getPhone());
                        policy.getInsuredPerson().setEmail(policyDetails.getInsuredPerson().getEmail());
                        policy.getInsuredPerson().setAddress(policyDetails.getInsuredPerson().getAddress());
                    }

                    return policyRepository.save(policy);
                })
                .orElseThrow(() -> new RuntimeException("Policy not found with id " + id));
    }

    @Transactional
    public void deletePolicy(Long id) {
        policyRepository.deleteById(id);
    }

    private String generatePolicyNumber() {
        return "POL-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private void createExpiryReminder(InsurancePolicy policy) {
        LocalDate reminderDate = policy.getExpiryDate().minusDays(30);
        if (reminderDate.isAfter(LocalDate.now())) {
            Reminder reminder = new Reminder();
            reminder.setType("EXPIRY");
            reminder.setTitle("保单到期提醒 - " + policy.getPolicyNumber());
            reminder.setMessage("保单号 " + policy.getPolicyNumber() + " 将于 " + policy.getExpiryDate() + " 到期，请及时续保。");
            reminder.setReminderDate(reminderDate);
            reminder.setStatus("PENDING");
            reminder.setPolicy(policy);
            reminderRepository.save(reminder);
        }
    }
}
