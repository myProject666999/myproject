package com.insurance.controller;

import com.insurance.entity.PaymentRecord;
import com.insurance.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<PaymentRecord>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentRecord> getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/policy/{policyId}")
    public ResponseEntity<List<PaymentRecord>> getPaymentsByPolicyId(@PathVariable Long policyId) {
        return ResponseEntity.ok(paymentService.getPaymentsByPolicyId(policyId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PaymentRecord>> getPaymentsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(paymentService.getPaymentsByStatus(status));
    }

    @GetMapping("/upcoming/{days}")
    public ResponseEntity<List<PaymentRecord>> getUpcomingPayments(@PathVariable int days) {
        return ResponseEntity.ok(paymentService.getUpcomingPayments(days));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<PaymentRecord>> getOverduePayments() {
        return ResponseEntity.ok(paymentService.getOverduePayments());
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<PaymentRecord> markAsPaid(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String paymentMethod = request.getOrDefault("paymentMethod", "BANK_TRANSFER");
        String transactionId = request.get("transactionId");
        return ResponseEntity.ok(paymentService.markAsPaid(id, paymentMethod, transactionId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PaymentRecord> updatePaymentStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        return ResponseEntity.ok(paymentService.updatePaymentStatus(id, status));
    }
}
