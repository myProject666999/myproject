package com.gtd.controller;

import com.gtd.entity.WeeklyReview;
import com.gtd.service.WeeklyReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class WeeklyReviewController {

    @Autowired
    private WeeklyReviewService weeklyReviewService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WeeklyReview>> getAllReviews(@PathVariable Long userId) {
        return ResponseEntity.ok(weeklyReviewService.getAllReviews(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WeeklyReview> getReviewById(@PathVariable Long id) {
        return weeklyReviewService.getReviewById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/generate/{userId}")
    public ResponseEntity<WeeklyReview> generateWeeklyReview(@PathVariable Long userId) {
        return ResponseEntity.ok(weeklyReviewService.generateWeeklyReview(userId));
    }

    @PostMapping
    public ResponseEntity<WeeklyReview> saveReview(@RequestBody WeeklyReview review) {
        return ResponseEntity.ok(weeklyReviewService.saveReview(review));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        weeklyReviewService.deleteReview(id);
        return ResponseEntity.ok().build();
    }
}
