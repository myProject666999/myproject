package com.insurance.controller;

import com.insurance.entity.Claim;
import com.insurance.service.ClaimService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/claims")
@CrossOrigin(origins = "http://localhost:3000")
public class ClaimController {
    @Autowired
    private ClaimService claimService;

    @GetMapping
    public ResponseEntity<List<Claim>> getAllClaims() {
        return ResponseEntity.ok(claimService.getAllClaims());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Claim> getClaimById(@PathVariable Long id) {
        return claimService.getClaimById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/policy/{policyId}")
    public ResponseEntity<List<Claim>> getClaimsByPolicyId(@PathVariable Long policyId) {
        return ResponseEntity.ok(claimService.getClaimsByPolicyId(policyId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Claim>> getClaimsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(claimService.getClaimsByStatus(status));
    }

    @PostMapping("/policy/{policyId}")
    public ResponseEntity<Claim> createClaim(@PathVariable Long policyId, @RequestBody Claim claim) {
        return ResponseEntity.ok(claimService.createClaim(policyId, claim));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Claim> updateClaimStatus(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        String status = (String) request.get("status");
        BigDecimal approvedAmount = request.get("approvedAmount") != null ?
                new BigDecimal(request.get("approvedAmount").toString()) : null;
        String remarks = (String) request.get("remarks");
        return ResponseEntity.ok(claimService.updateClaimStatus(id, status, approvedAmount, remarks));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClaim(@PathVariable Long id) {
        claimService.deleteClaim(id);
        return ResponseEntity.ok().build();
    }
}
