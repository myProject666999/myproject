package com.travel.controller;

import com.travel.entity.Budget;
import com.travel.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @GetMapping("/trip/{tripId}")
    public List<Budget> findByTripId(@PathVariable Long tripId) {
        return budgetService.findByTripId(tripId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Budget> findById(@PathVariable Long id) {
        return budgetService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Budget create(@RequestBody Budget budget) {
        return budgetService.save(budget);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Budget> update(@PathVariable Long id, @RequestBody Budget budget) {
        return budgetService.findById(id)
                .map(existing -> {
                    budget.setId(id);
                    return ResponseEntity.ok(budgetService.save(budget));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return budgetService.findById(id)
                .map(budget -> {
                    budgetService.deleteById(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
