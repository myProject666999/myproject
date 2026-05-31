package com.insurance.controller;

import com.insurance.entity.InsurancePolicy;
import com.insurance.service.InsurancePolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
@CrossOrigin(origins = "http://localhost:3000")
public class InsurancePolicyController {
    @Autowired
    private InsurancePolicyService policyService;

    @PostMapping
    public ResponseEntity<InsurancePolicy> createPolicy(@RequestBody InsurancePolicy policy) {
        return ResponseEntity.ok(policyService.createPolicy(policy));
    }

    @GetMapping
    public ResponseEntity<List<InsurancePolicy>> getAllPolicies() {
        return ResponseEntity.ok(policyService.getAllPolicies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsurancePolicy> getPolicyById(@PathVariable Long id) {
        return policyService.getPolicyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<InsurancePolicy>> getPoliciesByStatus(@PathVariable String status) {
        return ResponseEntity.ok(policyService.getPoliciesByStatus(status));
    }

    @GetMapping("/type/{insuranceType}")
    public ResponseEntity<List<InsurancePolicy>> getPoliciesByType(@PathVariable String insuranceType) {
        return ResponseEntity.ok(policyService.getPoliciesByType(insuranceType));
    }

    @GetMapping("/active")
    public ResponseEntity<List<InsurancePolicy>> getActivePolicies() {
        return ResponseEntity.ok(policyService.getActivePolicies());
    }

    @GetMapping("/expiring-soon/{days}")
    public ResponseEntity<List<InsurancePolicy>> getPoliciesExpiringSoon(@PathVariable int days) {
        return ResponseEntity.ok(policyService.getPoliciesExpiringSoon(days));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InsurancePolicy> updatePolicy(@PathVariable Long id, @RequestBody InsurancePolicy policyDetails) {
        return ResponseEntity.ok(policyService.updatePolicy(id, policyDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        policyService.deletePolicy(id);
        return ResponseEntity.ok().build();
    }
}
