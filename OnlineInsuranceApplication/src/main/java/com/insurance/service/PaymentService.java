package com.insurance.service;

import com.insurance.entity.PaymentRecord;
import com.insurance.repository.PaymentRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {
    @Autowired
    private PaymentRecordRepository paymentRepository;

    public List<PaymentRecord> getAllPayments() {
        return paymentRepository.findAll();
    }

    public List<PaymentRecord> getPaymentsByPolicyId(Long policyId) {
        return paymentRepository.findByPolicyIdOrderByDueDateDesc(policyId);
    }

    public List<PaymentRecord> getPaymentsByStatus(String status) {
        return paymentRepository.findByStatus(status);
    }

    public List<PaymentRecord> getUpcomingPayments(int days) {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(days);
        return paymentRepository.findPaymentsDueBetween(startDate, endDate);
    }

    public List<PaymentRecord> getOverduePayments() {
        return paymentRepository.findOverduePayments("PENDING", LocalDate.now());
    }

    public Optional<PaymentRecord> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }

    @Transactional
    public PaymentRecord markAsPaid(Long id, String paymentMethod, String transactionId) {
        return paymentRepository.findById(id)
                .map(payment -> {
                    payment.setStatus("PAID");
                    payment.setPaymentDate(LocalDate.now());
                    payment.setPaymentMethod(paymentMethod);
                    payment.setTransactionId(transactionId);
                    return paymentRepository.save(payment);
                })
                .orElseThrow(() -> new RuntimeException("Payment record not found with id " + id));
    }

    @Transactional
    public PaymentRecord updatePaymentStatus(Long id, String status) {
        return paymentRepository.findById(id)
                .map(payment -> {
                    payment.setStatus(status);
                    return paymentRepository.save(payment);
                })
                .orElseThrow(() -> new RuntimeException("Payment record not found with id " + id));
    }
}
