package com.example.movierecord.controller;

import com.example.movierecord.entity.YearTop;
import com.example.movierecord.service.YearTopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/year-top")
public class YearTopController {

    @Autowired
    private YearTopService yearTopService;

    private static final Long DEFAULT_USER_ID = 1L;

    @GetMapping("/{year}")
    public ResponseEntity<List<YearTop>> getYearTop(@PathVariable Integer year) {
        return ResponseEntity.ok(yearTopService.getYearTop(DEFAULT_USER_ID, year));
    }

    @GetMapping("/years")
    public ResponseEntity<List<Integer>> getTopYears() {
        return ResponseEntity.ok(yearTopService.getTopYears(DEFAULT_USER_ID));
    }

    @PostMapping
    public ResponseEntity<YearTop> createYearTop(@RequestBody YearTop yearTop) {
        yearTop.setUserId(DEFAULT_USER_ID);
        try {
            YearTop saved = yearTopService.saveYearTop(yearTop);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteYearTop(@PathVariable Long id) {
        yearTopService.deleteYearTop(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear/{year}")
    public ResponseEntity<Void> clearYearTop(@PathVariable Integer year) {
        yearTopService.clearYearTop(DEFAULT_USER_ID, year);
        return ResponseEntity.noContent().build();
    }
}
