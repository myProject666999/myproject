package com.onsiterepair.controller;

import com.onsiterepair.common.Result;
import com.onsiterepair.entity.Review;
import com.onsiterepair.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/create")
    public Result<Review> createReview(@RequestBody Review review, @RequestAttribute("userId") Long userId) {
        review.setUserId(userId);
        return Result.success(reviewService.createReview(review));
    }

    @GetMapping("/worker/{workerId}")
    public Result<List<Review>> getWorkerReviews(@PathVariable Long workerId) {
        return Result.success(reviewService.getWorkerReviews(workerId));
    }

    @PostMapping("/reply/{reviewId}")
    public Result<Review> replyReview(
            @PathVariable Long reviewId,
            @RequestAttribute("userId") Long workerId,
            @RequestParam String content) {
        return Result.success(reviewService.replyReview(reviewId, workerId, content));
    }
}
